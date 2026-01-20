import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Forgeflow } from "../target/types/forgeflow";
import { expect } from "chai";
import { v4 as uuidv4 } from "uuid";

describe("forgeflow", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Forgeflow as Program<Forgeflow>;
  const owner = provider.wallet;

  // Test data
  const workflowId = uuidv4().slice(0, 32);
  const workflowName = "Test Workflow";
  const workflowJson = JSON.stringify({
    id: workflowId,
    name: workflowName,
    nodes: [
      { id: "trigger-1", type: "trigger", position: { x: 100, y: 100 }, data: { label: "Start" } },
      { id: "api-1", type: "api", position: { x: 100, y: 200 }, data: { label: "Fetch Data", url: "https://api.example.com" } },
    ],
    edges: [
      { id: "e1", source: "trigger-1", target: "api-1" },
    ],
  });

  let workflowPda: anchor.web3.PublicKey;
  let workflowBump: number;

  before(async () => {
    // Derive PDA for workflow
    [workflowPda, workflowBump] = await anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("workflow"),
        owner.publicKey.toBuffer(),
        Buffer.from(workflowId),
      ],
      program.programId
    );
  });

  it("Creates a workflow", async () => {
    const tx = await program.methods
      .createWorkflow(workflowId, workflowName, workflowJson)
      .accounts({
        workflow: workflowPda,
        owner: owner.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Create workflow tx:", tx);

    // Fetch and verify the workflow
    const workflow = await program.account.workflow.fetch(workflowPda);
    
    expect(workflow.owner.toString()).to.equal(owner.publicKey.toString());
    expect(workflow.workflowId).to.equal(workflowId);
    expect(workflow.name).to.equal(workflowName);
    expect(workflow.workflowJson).to.equal(workflowJson);
    expect(workflow.executionCount.toNumber()).to.equal(0);
    expect(workflow.isActive).to.equal(true);
  });

  it("Updates a workflow", async () => {
    const newName = "Updated Workflow";
    const newJson = JSON.stringify({ ...JSON.parse(workflowJson), name: newName });

    const tx = await program.methods
      .updateWorkflow(newName, newJson)
      .accounts({
        workflow: workflowPda,
        owner: owner.publicKey,
      })
      .rpc();

    console.log("Update workflow tx:", tx);

    // Fetch and verify
    const workflow = await program.account.workflow.fetch(workflowPda);
    expect(workflow.name).to.equal(newName);
    expect(workflow.workflowJson).to.equal(newJson);
  });

  it("Executes a workflow and stores results", async () => {
    const executionId = uuidv4().slice(0, 32);
    const resultJson = JSON.stringify({
      status: "completed",
      results: [
        { nodeId: "trigger-1", success: true, output: { triggered: true } },
        { nodeId: "api-1", success: true, output: { status: 200, data: {} } },
      ],
    });

    // Derive execution PDA
    const [executionPda] = await anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("execution"),
        workflowPda.toBuffer(),
        Buffer.from(executionId),
      ],
      program.programId
    );

    const tx = await program.methods
      .executeWorkflow(executionId, resultJson, true)
      .accounts({
        workflow: workflowPda,
        execution: executionPda,
        executor: owner.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Execute workflow tx:", tx);

    // Verify execution was stored
    const execution = await program.account.execution.fetch(executionPda);
    expect(execution.workflow.toString()).to.equal(workflowPda.toString());
    expect(execution.executionId).to.equal(executionId);
    expect(execution.success).to.equal(true);
    expect(execution.resultJson).to.equal(resultJson);

    // Verify workflow execution count incremented
    const workflow = await program.account.workflow.fetch(workflowPda);
    expect(workflow.executionCount.toNumber()).to.equal(1);
  });

  it("Toggles workflow active status", async () => {
    const tx = await program.methods
      .toggleWorkflow()
      .accounts({
        workflow: workflowPda,
        owner: owner.publicKey,
      })
      .rpc();

    console.log("Toggle workflow tx:", tx);

    const workflow = await program.account.workflow.fetch(workflowPda);
    expect(workflow.isActive).to.equal(false);

    // Toggle back
    await program.methods
      .toggleWorkflow()
      .accounts({
        workflow: workflowPda,
        owner: owner.publicKey,
      })
      .rpc();

    const workflow2 = await program.account.workflow.fetch(workflowPda);
    expect(workflow2.isActive).to.equal(true);
  });

  it("Fails when non-owner tries to update", async () => {
    // Generate a new keypair (not the owner)
    const attacker = anchor.web3.Keypair.generate();
    
    // Airdrop some SOL to attacker
    const signature = await provider.connection.requestAirdrop(
      attacker.publicKey,
      1 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);

    try {
      await program.methods
        .updateWorkflow("Hacked!", "{}")
        .accounts({
          workflow: workflowPda,
          owner: attacker.publicKey,
        })
        .signers([attacker])
        .rpc();
      
      expect.fail("Should have thrown an error");
    } catch (err) {
      expect(err.toString()).to.include("has_one");
    }
  });

  it("Deletes a workflow", async () => {
    const tx = await program.methods
      .deleteWorkflow()
      .accounts({
        workflow: workflowPda,
        owner: owner.publicKey,
      })
      .rpc();

    console.log("Delete workflow tx:", tx);

    // Verify workflow is deleted
    try {
      await program.account.workflow.fetch(workflowPda);
      expect.fail("Workflow should be deleted");
    } catch (err) {
      expect(err.toString()).to.include("Account does not exist");
    }
  });
});
