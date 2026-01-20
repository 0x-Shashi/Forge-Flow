'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { LogicNodeData } from '@/types/workflow';

const LogicNode = memo(({ data, selected }: NodeProps<LogicNodeData>) => {
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
          [ LOGIC GATE ]
        </span>
      </div>

      {/* Content */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--text-secondary)]">
             <span>IF</span>
             <span className="text-white border-b border-[var(--border-subtle)]">{data.condition || '...'}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--text-secondary)]">
             <span>{data.operator?.toUpperCase() || 'IS'}</span>
             <span className="text-white border-b border-[var(--border-subtle)]">{data.value || '...'}</span>
          </div>
        </div>
      </div>

      {/* Logic Handles - True/False */}
      <div className="flex justify-between px-4 pb-3">
         <div className="relative">
            <span className="text-[9px] font-mono text-[var(--text-tertiary)] absolute -top-4 left-0">TRUE</span>
            <Handle
              type="source"
              position={Position.Bottom}
              id="true"
              className="!w-2 !h-2 !bg-black !border !border-white hover:!bg-white rounded-none !left-2"
            />
         </div>
         <div className="relative">
            <span className="text-[9px] font-mono text-[var(--text-tertiary)] absolute -top-4 right-0">FALSE</span>
             <Handle
              type="source"
              position={Position.Bottom}
              id="false"
              className="!w-2 !h-2 !bg-black !border !border-[var(--text-secondary)] hover:!bg-white rounded-none !left-auto !right-2"
            />
         </div>
      </div>
    </div>
  );
});

LogicNode.displayName = 'LogicNode';
export default LogicNode;
