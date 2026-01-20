'use client';

import React, { useState, useEffect } from 'react';
import { useSolana } from '@/hooks/useSolana';
import { useWorkflowStore } from '@/stores/workflowStore';

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

interface WorkflowLibraryProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WorkflowLibrary({ isOpen, onClose }: WorkflowLibraryProps) {
  const [workflows, setWorkflows] = useState<StoredWorkflow[]>([]);
  const { connected, getWorkflows, deleteWorkflow, toggleWorkflow } = useSolana();
  const { loadWorkflow } = useWorkflowStore();

  useEffect(() => {
    if (isOpen) {
      loadWorkflows();
    }
  }, [isOpen, connected]);

  const loadWorkflows = () => {
    const stored = getWorkflows();
    setWorkflows(stored);
  };

  const handleLoad = (workflow: StoredWorkflow) => {
    try {
      const parsed = JSON.parse(workflow.workflowJson);
      loadWorkflow(parsed);
      onClose();
    } catch (err) {
      console.error('Failed to load workflow:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this workflow?')) {
      await deleteWorkflow(id);
      loadWorkflows();
    }
  };

  const handleToggle = async (id: string) => {
    await toggleWorkflow(id);
    loadWorkflows();
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div 
          className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] w-full max-w-2xl max-h-[80vh] shadow-2xl pointer-events-auto flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-center">
             <div>
                <h2 className="text-sm font-bold tracking-[0.2em] text-white uppercase font-mono">
                  Saved Workflows
                </h2>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-1 font-mono">
                  Chain: Solana Devnet
                </p>
             </div>
             <div className="text-[10px] font-mono border px-2 py-1 border-[var(--border-subtle)] text-[var(--text-secondary)]">
                {workflows.length} ITEMS
             </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1 bg-[var(--bg-app)]">
            {!connected ? (
              <div className="text-center py-12 border border-dashed border-[var(--border-subtle)]">
                <p className="text-xs font-mono text-[var(--text-secondary)]">WALLET NOT CONNECTED</p>
              </div>
            ) : workflows.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[var(--border-subtle)]">
                <p className="text-xs font-mono text-[var(--text-secondary)]">NO WORKFLOWS FOUND</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className={`
                      p-4 border transition-colors group
                      ${workflow.isActive 
                        ? 'bg-[var(--bg-panel)] border-[var(--border-subtle)] hover:border-white' 
                        : 'bg-[var(--bg-app)] border-[var(--border-subtle)] opacity-50'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => handleLoad(workflow)}
                      >
                        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide group-hover:underline decoration-1 underline-offset-4">
                          {workflow.name}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-[10px] font-mono text-[var(--text-secondary)]">
                          <span>
                            UPDATED: {new Date(workflow.updatedAt).toLocaleDateString()}
                          </span>
                          <span>
                            EXECS: {workflow.executionCount}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggle(workflow.id)}
                          className="px-2 py-1 border border-[var(--border-subtle)] text-[10px] text-[var(--text-secondary)] hover:text-white hover:border-white font-mono uppercase transition-colors"
                        >
                          {workflow.isActive ? 'DISABLE' : 'ENABLE'}
                        </button>
                        <button
                          onClick={() => handleDelete(workflow.id)}
                          className="px-2 py-1 border border-[var(--border-subtle)] text-[10px] text-[var(--text-secondary)] hover:text-red-500 hover:border-red-500 font-mono uppercase transition-colors"
                        >
                          DEL
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--border-subtle)]">
            <button
              onClick={onClose}
              className="w-full py-2 btn-premium uppercase"
            >
              Close Library
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
