'use client';

import React, { DragEvent } from 'react';
import { NodeType } from '@/types/workflow';
import ExecutionHistory from './ExecutionHistory';

interface NodeItem {
  type: NodeType;
  label: string;
  description: string;
}

const nodeItems: NodeItem[] = [
  {
    type: 'trigger',
    label: 'TRIGGER',
    description: 'Start Sequence',
  },
  {
    type: 'api',
    label: 'API REQUEST',
    description: 'Fetch External Data',
  },
  {
    type: 'ai',
    label: 'AI MODEL',
    description: 'LLM Processing',
  },
  {
    type: 'logic',
    label: 'LOGIC CTRL',
    description: 'Conditional Branching',
  },
  {
    type: 'action',
    label: 'ACTION',
    description: 'Final execution step',
  },
];

export default function NodePanel() {
  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 h-full bg-[var(--bg-panel)] border-r border-[var(--border-subtle)] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[var(--border-subtle)]">
        <h2 className="text-xs font-bold tracking-[0.2em] text-white uppercase font-mono">
          Components
        </h2>
        <p className="text-[10px] text-[var(--text-tertiary)] mt-1 uppercase tracking-wider">
          Drag to Canvas
        </p>
      </div>

      {/* Node List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {nodeItems.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => onDragStart(e, item.type)}
            className="
              cement-card p-4 cursor-grab active:cursor-grabbing
              flex flex-col gap-1 group
            "
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-white group-hover:text-white transition-colors">
                [{item.label}]
              </span>
              <div className="w-1.5 h-1.5 bg-[var(--border-light)] group-hover:bg-white transition-colors rounded-sm" />
            </div>
            <span className="text-[10px] text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] uppercase tracking-wide transition-colors">
              {item.description}
            </span>
          </div>
        ))}
      </div>

      {/* Execution History */}
      <div className="border-t border-[var(--border-subtle)]">
         <ExecutionHistory />
      </div>

      {/* Footer Tip */}
      <div className="p-4 border-t border-[var(--border-subtle)]">
        <div className="p-3 bg-[var(--bg-app)] border border-[var(--border-subtle)]">
          <p className="text-[10px] text-[var(--text-tertiary)] font-mono">
            STATUS: <span className="text-green-500">SYSTEM READY</span>
          </p>
        </div>
      </div>
    </div>
  );
}
