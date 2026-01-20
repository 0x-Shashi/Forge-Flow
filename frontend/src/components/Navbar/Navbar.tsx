'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useWorkflow } from '@/hooks/useWorkflow';
import { useSolana } from '@/hooks/useSolana';
import { demoWorkflows } from '@/utils/demoWorkflows';
import { serializeWorkflow } from '@/utils/workflowSerializer';
import WorkflowLibrary from '@/components/Sidebar/WorkflowLibrary';

export default function Navbar() {
  const [isWorkflowMenuOpen, setIsWorkflowMenuOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  
  const { connected, disconnect, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { 
    balance, 
    storeWorkflow, 
    requestAirdrop,
    isLoading: isSolanaLoading 
  } = useSolana();
  
  const { 
    nodes,
    edges,
    workflowName, 
    workflowId,
    setWorkflowName, 
    saveWorkflow, 
    clearWorkflow,
    isExecuting
  } = useWorkflowStore();

  const { run, exportAsJson, importFromFile, loadDemo } = useWorkflow();

  const handleRun = async () => {
    await run();
  };

  const handleSave = () => {
    saveWorkflow();
  };

  const handleSaveToBlockchain = async () => {
    if (!connected) {
      setVisible(true);
      return;
    }

    const workflow = serializeWorkflow(nodes, edges, workflowName, workflowId || undefined);
    await storeWorkflow(workflow.id, workflow.name, JSON.stringify(workflow));
  };

  const handleConnectWallet = () => {
    setVisible(true);
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <>
      <nav className="h-16 bg-[var(--bg-app)] border-b border-[var(--border-subtle)] flex items-center justify-between px-8">
        {/* Left Section - Logo & Name */}
        <div className="flex items-center gap-8">
          {/* Text Logo */}
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-[0.2em] text-white uppercase font-mono">
              FORGE FLOW
            </span>
          </div>

          {/* Workflow Name Input */}
          <div className="group flex items-center">
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="bg-transparent text-sm text-[var(--text-secondary)] focus:text-white border-none outline-none w-48 transition-colors font-mono tracking-wide"
              placeholder="UNTITLED WORKFLOW"
            />
          </div>
        </div>

        {/* Center Section - Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            className="btn-premium"
          >
            Save
          </button>

          <div className="relative">
            <button
              onClick={() => setIsWorkflowMenuOpen(!isWorkflowMenuOpen)}
              className="btn-premium"
            >
              Workflows
            </button>

            {isWorkflowMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsWorkflowMenuOpen(false)} 
                />
                <div className="absolute top-full left-0 mt-2 w-64 bg-[var(--bg-panel)] border border-[var(--border-subtle)] shadow-2xl z-50 p-2">
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        clearWorkflow();
                        setIsWorkflowMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-card)] transition-colors uppercase tracking-wider"
                    >
                      New Workflow
                    </button>
                    {connected && (
                      <button
                        onClick={() => {
                          setIsLibraryOpen(true);
                          setIsWorkflowMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-card)] transition-colors uppercase tracking-wider"
                      >
                        My Workflows
                      </button>
                    )}
                    <button
                      onClick={() => {
                        importFromFile();
                        setIsWorkflowMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-card)] transition-colors uppercase tracking-wider"
                    >
                      Import JSON
                    </button>
                    <button
                      onClick={() => {
                        exportAsJson();
                        setIsWorkflowMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-card)] transition-colors uppercase tracking-wider"
                    >
                      Export JSON
                    </button>
                  </div>
                  
                  <div className="border-t border-[var(--border-subtle)] my-2 pt-2">
                    <p className="px-4 py-2 text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest">
                      Templates
                    </p>
                    {demoWorkflows.map((demo) => (
                      <button
                        key={demo.id}
                        onClick={() => {
                          loadDemo(demo);
                          setIsWorkflowMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-card)] transition-colors"
                      >
                        {demo.name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleRun}
            disabled={isExecuting}
            className="btn-premium-primary"
          >
            {isExecuting ? 'PROCESSING...' : 'RUN WORKFLOW'}
          </button>
        </div>

        {/* Right Section - Wallet */}
        <div className="flex items-center gap-6">
          {connected ? (
            <>
              <div className="text-sm font-mono text-[var(--text-secondary)]">
                {balance.toFixed(4)} SOL
              </div>

               <button
                  onClick={async () => await requestAirdrop(1)}
                  disabled={isSolanaLoading}
                  className="text-[var(--text-tertiary)] hover:text-white text-xs uppercase"
                  title="Get Devnet SOL"
                >
                  [AIRDROP]
                </button>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSaveToBlockchain}
                  disabled={isSolanaLoading}
                  className="text-xs uppercase tracking-wider text-[var(--text-secondary)] hover:text-white border-b border-transparent hover:border-white transition-all pb-0.5"
                >
                  Save On-Chain
                </button>

                <div className="h-4 w-px bg-[var(--border-subtle)]"></div>

                <div className="relative group">
                  <button className="text-sm font-mono text-white">
                    {shortenAddress(publicKey?.toString() || '')}
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="absolute top-full right-0 mt-2 hidden group-hover:block text-xs text-red-500 bg-[var(--bg-panel)] border border-[var(--border-subtle)] px-2 py-1"
                  >
                    DISCONNECT
                  </button>
                </div>
              </div>
            </>
          ) : (
            <button
              onClick={handleConnectWallet}
              className="btn-premium"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </nav>

      <WorkflowLibrary 
        isOpen={isLibraryOpen} 
        onClose={() => setIsLibraryOpen(false)} 
      />
    </>
  );
}
