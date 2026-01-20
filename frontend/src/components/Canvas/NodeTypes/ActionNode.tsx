'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ActionNodeData } from '@/types/workflow';

const ActionNode = memo(({ data, selected }: NodeProps<ActionNodeData>) => {
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
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-black !border !border-[var(--text-secondary)] hover:!bg-white rounded-none"
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-panel)]">
        <span className="text-xs font-bold font-mono tracking-[0.1em] text-white uppercase">
          [ ACTION ]
        </span>
        {data.isSuccess && <span className="text-[10px] text-white">DONE</span>}
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider block">
            Type
        </span>
        <span className="text-xs font-mono text-white">
          {data.actionType === 'save' ? 'SAVE TO STORAGE' : 
           data.actionType === 'notify' ? 'SEND NOTIFICATION' : 
           data.actionType.toUpperCase()}
        </span>
      </div>

    </div>
  );
});

ActionNode.displayName = 'ActionNode';
export default ActionNode;
