'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { TriggerNodeData } from '@/types/workflow';

const TriggerNode = memo(({ data, selected }: NodeProps<TriggerNodeData>) => {
  return (
    <div
      className={`
        cement-card min-w-[200px] bg-[var(--bg-card)]
        ${selected ? 'border-[var(--border-selected)] ring-1 ring-white' : 'border-[var(--border-subtle)]'}
        ${data.isExecuting ? 'ring-1 ring-white animate-pulse' : ''}
        ${data.isSuccess ? 'border-white' : ''}
        ${data.isError ? 'border-red-500' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-panel)]">
        <span className="text-xs font-bold font-mono tracking-[0.1em] text-white uppercase">
          [ TRIGGER ]
        </span>
        {data.isExecuting && (
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-3 space-y-2">
        <div>
          <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider block">
            Label
          </span>
          <span className="text-xs font-mono text-[var(--text-secondary)]">
            {data.label}
          </span>
        </div>
        
        <div>
           <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider block">
            Type
          </span>
          <span className="text-xs font-mono text-white">
            {data.triggerType.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-black !border !border-[var(--text-secondary)] hover:!bg-white rounded-none"
      />
    </div>
  );
});

TriggerNode.displayName = 'TriggerNode';
export default TriggerNode;
