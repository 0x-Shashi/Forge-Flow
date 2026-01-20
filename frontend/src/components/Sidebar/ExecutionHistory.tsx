'use client';

import React, { useState, useEffect } from 'react';
import { useSolana } from '@/hooks/useSolana';

interface ExecutionRecord {
  executionId: string;
  workflowId: string;
  resultJson: string;
  success: boolean;
  executedAt: number;
}

export default function ExecutionHistory() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [executions, setExecutions] = useState<ExecutionRecord[]>([]);

  useEffect(() => {
    loadExecutions();
  }, []);

  const loadExecutions = () => {
    try {
      const stored = JSON.parse(
        localStorage.getItem('solana_executions') || '[]'
      ) as ExecutionRecord[];
      setExecutions(stored.slice(-10).reverse()); 
    } catch (err) {
      console.error('Failed to load executions:', err);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('solana_executions');
    setExecutions([]);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="border-t border-[var(--border-subtle)]">
      {/* Header */}
      <button
        onClick={() => {
          setIsExpanded(!isExpanded);
          loadExecutions();
        }}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-[var(--bg-card)] transition-colors group"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold tracking-[0.1em] text-white uppercase font-mono">
            Logs
          </span>
          {executions.length > 0 && (
            <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
              [{executions.length}]
            </span>
          )}
        </div>
        <div className={`text-[10px] text-[var(--text-tertiary)] font-mono transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-4 bg-[var(--bg-app)] border-b border-[var(--border-subtle)]">
          {executions.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-[var(--border-subtle)]">
              <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">No Logs Available</p>
            </div>
          ) : (
            <>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                 {/* Header Row */}
                 <div className="grid grid-cols-[1fr_auto] px-2 pb-1 border-b border-[var(--border-subtle)] mb-2">
                    <span className="text-[9px] uppercase text-[var(--text-tertiary)]">Status / ID</span>
                    <span className="text-[9px] uppercase text-[var(--text-tertiary)]">Time</span>
                 </div>

                {executions.map((exec) => (
                  <div
                    key={exec.executionId}
                    className="p-2 border border-[var(--border-subtle)] hover:border-white transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className={`w-1.5 h-1.5 rounded-sm ${exec.success ? 'bg-white' : 'bg-red-500'}`} />
                         <span className={`text-[10px] font-mono ${exec.success ? 'text-white' : 'text-red-500'}`}>
                           {exec.success ? 'SUCC' : 'FAIL'}
                         </span>
                         <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                           {exec.executionId.slice(0, 8)}
                         </span>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--text-tertiary)] group-hover:text-white">
                        {formatTime(exec.executedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={clearHistory}
                className="w-full mt-3 py-1.5 border border-[var(--border-subtle)] text-[10px] text-[var(--text-secondary)] hover:text-white hover:border-white transition-colors uppercase tracking-wider"
              >
                Clear Logs
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
