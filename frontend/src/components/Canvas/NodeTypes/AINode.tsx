'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { AINodeData } from '@/types/workflow';

const AINode = memo(({ data, selected }: NodeProps<AINodeData>) => {
  return (
    <div
      className={`
        cement-card min-w-[240px] bg-[var(--bg-card)]
        ${selected ? 'border-[var(--border-selected)] ring-1 ring-white' : 'border-[var(--border-subtle)]'}
        ${data.isExecuting ? 'ring-1 ring-white animate-pulse' : ''}
        ${data.isSuccess ? 'border-white' : ''}
        ${data.isError ? 'border-red-500' : ''}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-black !border !border-[var(--text-secondary)] hover:!bg-white rounded-none"
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-panel)]">
        <span className="text-xs font-bold font-mono tracking-[0.1em] text-white uppercase">
          [ AI MODEL ]
        </span>
        {data.isExecuting && (
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-3 space-y-3">
        <div>
          <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider block">
            Provider / Model
          </span>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-[10px] font-mono text-white px-1.5 py-0.5 border border-[var(--border-subtle)]">
                {data.model.toUpperCase()}
             </span>
             <span className="text-[10px] font-mono text-[var(--text-secondary)] truncate max-w-[120px]">
                {data.modelId}
             </span>
          </div>
        </div>

        <div>
           <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider block mb-1">
            Prompt
          </span>
          <div className="p-2 bg-[var(--bg-app)] border border-[var(--border-subtle)]">
            <p className="text-[10px] font-mono text-[var(--text-secondary)] line-clamp-2">
              {data.userPrompt || 'No prompt configured'}
            </p>
          </div>
        </div>

        {/* Execution Result - NEW SECTION */}
        {data.output && (typeof data.output === 'string' || typeof data.output === 'object') && (
          <div className="mt-2 pt-2 border-t border-[var(--border-subtle)]">
             <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider block mb-1">
              Result
            </span>
            <div className="p-2 bg-[#050505] border border-[var(--border-light)] max-h-[100px] overflow-y-auto custom-scrollbar">
              <p className="text-[10px] font-mono text-white whitespace-pre-wrap">
                {/* Allow handling of object output like { model:..., response:... } */}
                {typeof data.output === 'object' && data.output !== null 
                  // @ts-ignore - response exists on AINode output
                  ? (data.output as any).response || JSON.stringify(data.output, null, 2)
                  : String(data.output)
                }
              </p>
            </div>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-black !border !border-[var(--text-secondary)] hover:!bg-white rounded-none"
      />
    </div>
  );
});

AINode.displayName = 'AINode';
export default AINode;
