# 🔗 ForgeFlow - Solana Smart Contract

This directory contains the Anchor smart contract for ForgeFlow.

## Prerequisites

Before building the smart contract, you need to install:

1. **Rust** - https://rustup.rs/

   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Solana CLI** - https://docs.solana.com/cli/install-solana-cli-tools

   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
   ```

3. **Anchor** - https://www.anchor-lang.com/docs/installation
   ```bash
   cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
   avm install latest
   avm use latest
   ```

## Setup

1. Configure Solana for devnet:

   ```bash
   solana config set --url devnet
   ```

2. Create a wallet (if you don't have one):

   ```bash
   solana-keygen new
   ```

3. Get some devnet SOL:
   ```bash
   solana airdrop 2
   ```

## Build & Deploy

```bash
# Build the program
anchor build

# Deploy to devnet
anchor deploy

# Run tests
anchor test
```

## Program Structure

```
programs/forgeflow/src/lib.rs
├── create_workflow    - Create a new workflow on-chain
├── update_workflow    - Update workflow name/JSON
├── execute_workflow   - Execute and store results
├── delete_workflow    - Remove workflow from chain
└── toggle_workflow    - Enable/disable workflow
```

## Accounts

| Account     | Description                       |
| ----------- | --------------------------------- |
| `Workflow`  | Stores workflow metadata and JSON |
| `Execution` | Stores execution results          |

## Instructions

### create_workflow

Creates a new workflow with the given ID, name, and JSON.

### update_workflow

Updates an existing workflow (owner only).

### execute_workflow

Executes a workflow and stores the result on-chain.

### delete_workflow

Deletes a workflow and refunds rent to owner.

## Update Program ID

After deploying, update the program ID in:

1. `programs/forgeflow/src/lib.rs` - `declare_id!(...)`
2. `Anchor.toml` - `[programs.devnet]`
3. `frontend/src/hooks/useSolana.ts`
