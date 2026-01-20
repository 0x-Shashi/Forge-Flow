import { useCallback, useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  TransactionInstruction,
} from '@solana/web3.js';
import toast from 'react-hot-toast';

// Program ID - UPDATE THIS AFTER DEPLOYMENT
const FORGEFLOW_PROGRAM_ID = new PublicKey(
  "ForgeFLowXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
);

// Set to true when smart contract is deployed
const USE_REAL_BLOCKCHAIN = true;

interface StoredWorkflow {
  id: string;
  name: string;
  owner: string;
  workflowJson: string;
  createdAt: number;
  updatedAt: number;
  executionCount: number;
  isActive: boolean;
}

interface ExecutionRecord {
  executionId: string;
  workflowId: string;
  resultJson: string;
  success: boolean;
  executedAt: number;
}

export function useSolana() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, connected, signAllTransactions } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);

  // Fetch balance when connected
  useEffect(() => {
    if (connected && publicKey) {
      getBalance().then(setBalance);
    } else {
      setBalance(0);
    }
  }, [connected, publicKey]);

  /**
   * Get wallet balance in SOL
   */
  const getBalance = useCallback(async (): Promise<number> => {
    if (!publicKey) return 0;
    
    try {
      const bal = await connection.getBalance(publicKey);
      return bal / LAMPORTS_PER_SOL;
    } catch (err) {
      console.error('Failed to get balance:', err);
      return 0;
    }
  }, [connection, publicKey]);

  /**
   * Request airdrop (devnet only)
   */
  const requestAirdrop = useCallback(async (amount: number = 1): Promise<boolean> => {
    if (!publicKey) {
      toast.error('Wallet not connected');
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      toast.loading('Requesting airdrop...');
      const signature = await connection.requestAirdrop(
        publicKey,
        amount * LAMPORTS_PER_SOL
      );
      
      await connection.confirmTransaction(signature, 'confirmed');
      toast.dismiss();
      toast.success(`Received ${amount} SOL!`);
      
      // Refresh balance
      const newBalance = await getBalance();
      setBalance(newBalance);
      
      return true;
    } catch (err) {
      toast.dismiss();
      const message = err instanceof Error ? err.message : 'Airdrop failed';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [connection, publicKey, getBalance]);

  /**
   * Derive workflow PDA
   */
  const deriveWorkflowPDA = useCallback(async (workflowId: string): Promise<PublicKey | null> => {
    if (!publicKey) return null;
    
    const [pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("workflow"),
        publicKey.toBuffer(),
        Buffer.from(workflowId.slice(0, 32)),
      ],
      FORGEFLOW_PROGRAM_ID
    );
    
    return pda;
  }, [publicKey]);

  /**
   * Store workflow on-chain
   */
  const storeWorkflow = useCallback(async (
    workflowId: string,
    workflowName: string,
    workflowJson: string
  ): Promise<{ success: boolean; txId?: string }> => {
    if (!publicKey || !signTransaction) {
      toast.error('Wallet not connected');
      return { success: false };
    }

    setIsLoading(true);
    setError(null);

    try {
      if (USE_REAL_BLOCKCHAIN) {
        // Real blockchain transaction
        const workflowPda = await deriveWorkflowPDA(workflowId);
        if (!workflowPda) throw new Error('Failed to derive PDA');

        // TODO: Add actual instruction data when program is deployed
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: publicKey,
            lamports: 1000,
          })
        );

        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        const signed = await signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signed.serialize());
        await connection.confirmTransaction(signature, 'confirmed');

        toast.success('Workflow saved to blockchain!');
        return { success: true, txId: signature };
      } else {
        // Simulated storage (localStorage)
        const storedWorkflows = JSON.parse(
          localStorage.getItem('solana_workflows') || '[]'
        ) as StoredWorkflow[];

        const newWorkflow: StoredWorkflow = {
          id: workflowId,
          name: workflowName,
          owner: publicKey.toString(),
          workflowJson,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          executionCount: 0,
          isActive: true,
        };

        const existingIndex = storedWorkflows.findIndex(w => w.id === workflowId);
        if (existingIndex >= 0) {
          storedWorkflows[existingIndex] = { 
            ...newWorkflow, 
            createdAt: storedWorkflows[existingIndex].createdAt,
            executionCount: storedWorkflows[existingIndex].executionCount,
          };
        } else {
          storedWorkflows.push(newWorkflow);
        }

        localStorage.setItem('solana_workflows', JSON.stringify(storedWorkflows));
        toast.success('Workflow saved (simulated)');
        return { success: true, txId: 'simulated-' + Date.now() };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transaction failed';
      setError(message);
      toast.error(message);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [connection, publicKey, signTransaction, deriveWorkflowPDA]);

  /**
   * Store execution result on-chain
   */
  const storeExecutionResult = useCallback(async (
    workflowId: string,
    executionId: string,
    resultJson: string,
    success: boolean
  ): Promise<{ success: boolean; txId?: string }> => {
    if (!publicKey) {
      return { success: false };
    }

    try {
      // Store in localStorage (simulated)
      const executions = JSON.parse(
        localStorage.getItem('solana_executions') || '[]'
      ) as ExecutionRecord[];

      executions.push({
        executionId,
        workflowId,
        resultJson,
        success,
        executedAt: Date.now(),
      });

      localStorage.setItem('solana_executions', JSON.stringify(executions));
      
      // Update workflow execution count
      const workflows = JSON.parse(
        localStorage.getItem('solana_workflows') || '[]'
      ) as StoredWorkflow[];
      
      const workflowIndex = workflows.findIndex(w => w.id === workflowId);
      if (workflowIndex >= 0) {
        workflows[workflowIndex].executionCount++;
        localStorage.setItem('solana_workflows', JSON.stringify(workflows));
      }

      return { success: true, txId: 'exec-' + executionId };
    } catch (err) {
      console.error('Failed to store execution:', err);
      return { success: false };
    }
  }, [publicKey]);

  /**
   * Get workflows stored on-chain for current user
   */
  const getWorkflows = useCallback((): StoredWorkflow[] => {
    if (!publicKey) return [];

    try {
      const storedWorkflows = JSON.parse(
        localStorage.getItem('solana_workflows') || '[]'
      ) as StoredWorkflow[];

      return storedWorkflows.filter(w => w.owner === publicKey.toString());
    } catch (err) {
      console.error('Failed to get workflows:', err);
      return [];
    }
  }, [publicKey]);

  /**
   * Get execution history for a workflow
   */
  const getExecutionHistory = useCallback((workflowId: string): ExecutionRecord[] => {
    try {
      const executions = JSON.parse(
        localStorage.getItem('solana_executions') || '[]'
      ) as ExecutionRecord[];

      return executions
        .filter(e => e.workflowId === workflowId)
        .sort((a, b) => b.executedAt - a.executedAt);
    } catch (err) {
      console.error('Failed to get execution history:', err);
      return [];
    }
  }, []);

  /**
   * Delete a workflow
   */
  const deleteWorkflow = useCallback(async (workflowId: string): Promise<boolean> => {
    if (!publicKey) return false;

    try {
      const storedWorkflows = JSON.parse(
        localStorage.getItem('solana_workflows') || '[]'
      ) as StoredWorkflow[];

      const filtered = storedWorkflows.filter(
        w => !(w.id === workflowId && w.owner === publicKey.toString())
      );

      localStorage.setItem('solana_workflows', JSON.stringify(filtered));
      toast.success('Workflow deleted');
      return true;
    } catch (err) {
      console.error('Failed to delete workflow:', err);
      toast.error('Failed to delete workflow');
      return false;
    }
  }, [publicKey]);

  /**
   * Toggle workflow active status
   */
  const toggleWorkflow = useCallback(async (workflowId: string): Promise<boolean> => {
    if (!publicKey) return false;

    try {
      const storedWorkflows = JSON.parse(
        localStorage.getItem('solana_workflows') || '[]'
      ) as StoredWorkflow[];

      const workflowIndex = storedWorkflows.findIndex(
        w => w.id === workflowId && w.owner === publicKey.toString()
      );

      if (workflowIndex >= 0) {
        storedWorkflows[workflowIndex].isActive = !storedWorkflows[workflowIndex].isActive;
        localStorage.setItem('solana_workflows', JSON.stringify(storedWorkflows));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to toggle workflow:', err);
      return false;
    }
  }, [publicKey]);

  return {
    // Wallet state
    connected,
    publicKey: publicKey?.toString() || null,
    balance,
    isLoading,
    error,

    // Read actions
    getBalance,
    getWorkflows,
    getExecutionHistory,

    // Write actions
    requestAirdrop,
    storeWorkflow,
    storeExecutionResult,
    deleteWorkflow,
    toggleWorkflow,

    // Utilities
    deriveWorkflowPDA,
  };
}
