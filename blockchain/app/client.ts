/**
 * ForgeFlow Solana Program Client
 * 
 * This module provides TypeScript functions to interact with the ForgeFlow
 * smart contract on Solana. Import this into the frontend to use real
 * blockchain integration.
 */

import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
} from "@solana/web3.js";
import { Buffer } from "buffer";

// Program ID - UPDATE THIS AFTER DEPLOYMENT
export const FORGEFLOW_PROGRAM_ID = new PublicKey(
  "ForgeFLowXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
);

// Account discriminators (first 8 bytes of sha256 hash of account name)
const WORKFLOW_DISCRIMINATOR = Buffer.from([/* Will be set after build */]);
const EXECUTION_DISCRIMINATOR = Buffer.from([/* Will be set after build */]);

/**
 * Derive the PDA for a workflow account
 */
export async function deriveWorkflowPDA(
  owner: PublicKey,
  workflowId: string
): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("workflow"),
      owner.toBuffer(),
      Buffer.from(workflowId),
    ],
    FORGEFLOW_PROGRAM_ID
  );
}

/**
 * Derive the PDA for an execution account
 */
export async function deriveExecutionPDA(
  workflow: PublicKey,
  executionId: string
): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("execution"),
      workflow.toBuffer(),
      Buffer.from(executionId),
    ],
    FORGEFLOW_PROGRAM_ID
  );
}

/**
 * Create instruction to create a new workflow
 */
export function createWorkflowInstruction(
  owner: PublicKey,
  workflowPda: PublicKey,
  workflowId: string,
  name: string,
  workflowJson: string
): TransactionInstruction {
  // Instruction data layout:
  // [8 bytes discriminator][4 + workflowId.length][4 + name.length][4 + json.length]
  
  const workflowIdBuffer = Buffer.from(workflowId);
  const nameBuffer = Buffer.from(name);
  const jsonBuffer = Buffer.from(workflowJson);

  const data = Buffer.concat([
    Buffer.from([/* create_workflow discriminator */]),
    encodeString(workflowId),
    encodeString(name),
    encodeString(workflowJson),
  ]);

  return new TransactionInstruction({
    keys: [
      { pubkey: workflowPda, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: FORGEFLOW_PROGRAM_ID,
    data,
  });
}

/**
 * Create instruction to update a workflow
 */
export function updateWorkflowInstruction(
  owner: PublicKey,
  workflowPda: PublicKey,
  name: string,
  workflowJson: string
): TransactionInstruction {
  const data = Buffer.concat([
    Buffer.from([/* update_workflow discriminator */]),
    encodeString(name),
    encodeString(workflowJson),
  ]);

  return new TransactionInstruction({
    keys: [
      { pubkey: workflowPda, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
    ],
    programId: FORGEFLOW_PROGRAM_ID,
    data,
  });
}

/**
 * Create instruction to execute a workflow
 */
export function executeWorkflowInstruction(
  executor: PublicKey,
  workflowPda: PublicKey,
  executionPda: PublicKey,
  executionId: string,
  resultJson: string,
  success: boolean
): TransactionInstruction {
  const data = Buffer.concat([
    Buffer.from([/* execute_workflow discriminator */]),
    encodeString(executionId),
    encodeString(resultJson),
    Buffer.from([success ? 1 : 0]),
  ]);

  return new TransactionInstruction({
    keys: [
      { pubkey: workflowPda, isSigner: false, isWritable: true },
      { pubkey: executionPda, isSigner: false, isWritable: true },
      { pubkey: executor, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: FORGEFLOW_PROGRAM_ID,
    data,
  });
}

/**
 * Create instruction to delete a workflow
 */
export function deleteWorkflowInstruction(
  owner: PublicKey,
  workflowPda: PublicKey
): TransactionInstruction {
  const data = Buffer.from([/* delete_workflow discriminator */]);

  return new TransactionInstruction({
    keys: [
      { pubkey: workflowPda, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: true },
    ],
    programId: FORGEFLOW_PROGRAM_ID,
    data,
  });
}

/**
 * Fetch all workflows for a user
 */
export async function fetchUserWorkflows(
  connection: Connection,
  owner: PublicKey
): Promise<any[]> {
  const accounts = await connection.getProgramAccounts(FORGEFLOW_PROGRAM_ID, {
    filters: [
      // Filter by owner
      {
        memcmp: {
          offset: 8, // After discriminator
          bytes: owner.toBase58(),
        },
      },
    ],
  });

  return accounts.map((account) => {
    return decodeWorkflowAccount(account.account.data);
  });
}

/**
 * Fetch a single workflow by PDA
 */
export async function fetchWorkflow(
  connection: Connection,
  workflowPda: PublicKey
): Promise<any | null> {
  const accountInfo = await connection.getAccountInfo(workflowPda);
  if (!accountInfo) return null;
  return decodeWorkflowAccount(accountInfo.data);
}

/**
 * Fetch execution history for a workflow
 */
export async function fetchExecutionHistory(
  connection: Connection,
  workflowPda: PublicKey
): Promise<any[]> {
  const accounts = await connection.getProgramAccounts(FORGEFLOW_PROGRAM_ID, {
    filters: [
      {
        memcmp: {
          offset: 8, // After discriminator
          bytes: workflowPda.toBase58(),
        },
      },
    ],
  });

  return accounts.map((account) => {
    return decodeExecutionAccount(account.account.data);
  });
}

// Helper: Encode string with length prefix
function encodeString(str: string): Buffer {
  const encoded = Buffer.from(str);
  const length = Buffer.alloc(4);
  length.writeUInt32LE(encoded.length, 0);
  return Buffer.concat([length, encoded]);
}

// Helper: Decode workflow account data
function decodeWorkflowAccount(data: Buffer): any {
  let offset = 8; // Skip discriminator

  const owner = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;

  const workflowIdLen = data.readUInt32LE(offset);
  offset += 4;
  const workflowId = data.slice(offset, offset + workflowIdLen).toString();
  offset += workflowIdLen;

  const nameLen = data.readUInt32LE(offset);
  offset += 4;
  const name = data.slice(offset, offset + nameLen).toString();
  offset += nameLen;

  const jsonLen = data.readUInt32LE(offset);
  offset += 4;
  const workflowJson = data.slice(offset, offset + jsonLen).toString();
  offset += jsonLen;

  const createdAt = data.readBigInt64LE(offset);
  offset += 8;
  const updatedAt = data.readBigInt64LE(offset);
  offset += 8;
  const executionCount = data.readBigUInt64LE(offset);
  offset += 8;
  const isActive = data.readUInt8(offset) === 1;

  return {
    owner: owner.toString(),
    workflowId,
    name,
    workflowJson,
    createdAt: Number(createdAt),
    updatedAt: Number(updatedAt),
    executionCount: Number(executionCount),
    isActive,
  };
}

// Helper: Decode execution account data
function decodeExecutionAccount(data: Buffer): any {
  let offset = 8; // Skip discriminator

  const workflow = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;
  const executor = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;

  const executionIdLen = data.readUInt32LE(offset);
  offset += 4;
  const executionId = data.slice(offset, offset + executionIdLen).toString();
  offset += executionIdLen;

  const resultJsonLen = data.readUInt32LE(offset);
  offset += 4;
  const resultJson = data.slice(offset, offset + resultJsonLen).toString();
  offset += resultJsonLen;

  const success = data.readUInt8(offset) === 1;
  offset += 1;
  const executedAt = data.readBigInt64LE(offset);

  return {
    workflow: workflow.toString(),
    executor: executor.toString(),
    executionId,
    resultJson,
    success,
    executedAt: Number(executedAt),
  };
}
