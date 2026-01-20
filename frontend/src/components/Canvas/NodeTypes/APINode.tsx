'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { APINodeData } from '@/types/workflow';

const APINode = memo(({ data, selected }: NodeProps<APINodeData>) => {
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
          [ API REQUEST ]
        </span>
        <span className={`text-[10px] font-mono px-1.5 py-0.5 border ${data.method === 'GET' ? 'border-[var(--text-secondary)]' : 'border-white'} text-white`}>
          {data.method}
        </span>
      </div>

      {/* Content */}
      <div className="px-4 py-3 space-y-3">
        <div>
          <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider block mb-1">
            Endpoint
          </span>
          <div className="p-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] overflow-hidden">
            <p className="text-[10px] font-mono text-[var(--text-secondary)] truncate">
              {data.url || 'NO URL CONFIGURED'}
            </p>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-black !border !border-[var(--text-secondary)] hover:!bg-white rounded-none"
      />
    </div>
  );
});

APINode.displayName = 'APINode';
export default APINode;
