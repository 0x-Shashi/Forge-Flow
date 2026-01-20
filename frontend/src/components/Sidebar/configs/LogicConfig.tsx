'use client';

import React from 'react';
import { LogicNodeData } from '@/types/workflow';

interface LogicConfigProps {
  data: LogicNodeData;
  onUpdate: (data: Partial<LogicNodeData>) => void;
}

const operators = [
  { value: 'equals', label: 'EQUALS', symbol: '==' },
  { value: 'contains', label: 'CONTAINS', symbol: '∋' },
  { value: 'greater', label: 'GREATER', symbol: '>' },
  { value: 'less', label: 'LESS', symbol: '<' },
  { value: 'exists', label: 'EXISTS', symbol: '∃' },
];

export default function LogicConfig({ data, onUpdate }: LogicConfigProps) {
  return (
    <div className="space-y-6">
      {/* Node Label */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
          Label
        </label>
        <input
          type="text"
          value={data.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="w-full px-3 py-2 bg-[var(--bg-app)] border-b border-[var(--border-subtle)] text-sm text-white focus:border-white focus:outline-none transition-colors font-mono"
          placeholder="ENTER LABEL..."
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
          Description
        </label>
        <input
          type="text"
          value={data.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="w-full px-3 py-2 bg-[var(--bg-app)] border-b border-[var(--border-subtle)] text-sm text-white focus:border-white focus:outline-none transition-colors font-mono"
          placeholder="ENTER DESCRIPTION..."
        />
      </div>

      {/* Condition Builder */}
      <div className="p-4 border border-[var(--border-subtle)] space-y-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-white border-b border-[var(--border-subtle)] pb-2">
          Condition Logic
        </div>

        {/* Condition (Field to check) */}
        <div>
          <label className="block text-[10px] uppercase text-[var(--text-tertiary)] mb-1">Field to Check</label>
          <input
            type="text"
            value={data.condition}
            onChange={(e) => onUpdate({ condition: e.target.value })}
            className="w-full px-3 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] text-sm text-white focus:border-white focus:outline-none font-mono"
            placeholder="e.g., response.status"
          />
        </div>

        {/* Operator */}
        <div>
          <label className="block text-[10px] uppercase text-[var(--text-tertiary)] mb-2">Operator</label>
          <div className="grid grid-cols-5 gap-1">
            {operators.map((op) => (
              <button
                key={op.value}
                onClick={() => onUpdate({ operator: op.value as LogicNodeData['operator'] })}
                className={`
                  py-2 border text-center transition-all
                  ${data.operator === op.value
                    ? 'bg-white border-white text-black'
                    : 'bg-transparent border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-white hover:text-white'
                  }
                `}
                title={op.label}
              >
                <span className="text-sm font-mono">{op.symbol}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[10px] font-mono text-[var(--text-secondary)] uppercase">
            SELECTED: {operators.find(o => o.value === data.operator)?.label}
          </p>
        </div>

        {/* Value */}
        {data.operator !== 'exists' && (
          <div>
            <label className="block text-[10px] uppercase text-[var(--text-tertiary)] mb-1">Target Value</label>
            <input
              type="text"
              value={data.value}
              onChange={(e) => onUpdate({ value: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] text-sm text-white focus:border-white focus:outline-none font-mono"
            />
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="p-4 bg-[var(--bg-app)] border border-[var(--border-subtle)]">
        <div className="text-[10px] uppercase text-[var(--text-tertiary)] mb-2">Preview</div>
        <code className="text-xs text-white font-mono break-all">
          IF ({data.condition || '...'} {operators.find(o => o.value === data.operator)?.symbol} {data.operator !== 'exists' ? (data.value || '...') : ''})
        </code>
      </div>
    </div>
  );
}
