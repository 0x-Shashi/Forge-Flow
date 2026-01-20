'use client';

import React from 'react';
import { ActionNodeData } from '@/types/workflow';

interface ActionConfigProps {
  data: ActionNodeData;
  onUpdate: (data: Partial<ActionNodeData>) => void;
}

const actionTypes = [
  { value: 'save', label: 'SAVE DATA' },
  { value: 'notify', label: 'NOTIFICATION' },
  { value: 'webhook', label: 'WEBHOOK' },
  { value: 'blockchain', label: 'BLOCKCHAIN' },
];

export default function ActionConfig({ data, onUpdate }: ActionConfigProps) {
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

      {/* Action Type */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
          Action Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {actionTypes.map((action) => (
            <button
              key={action.value}
              onClick={() => onUpdate({ actionType: action.value as ActionNodeData['actionType'] })}
              className={`
                p-3 border text-left transition-all
                ${data.actionType === action.value
                  ? 'bg-white border-white text-black'
                  : 'bg-transparent border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-white hover:text-white'
                }
              `}
            >
              <div className="text-xs font-mono font-bold">{action.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Action-specific settings */}
      {data.actionType === 'webhook' && (
        <div className="p-4 border border-[var(--border-subtle)] space-y-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-white border-b border-[var(--border-subtle)] pb-2">
            Webhook Parameters
          </div>
          
          <div>
            <label className="block text-[10px] uppercase text-[var(--text-tertiary)] mb-1">Target URL</label>
            <input
              type="text"
              value={data.webhookUrl || ''}
              onChange={(e) => onUpdate({ webhookUrl: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] text-xs text-white focus:border-white focus:outline-none font-mono"
              placeholder="HTTPS://..."
            />
          </div>
        </div>
      )}

      {data.actionType === 'save' && (
        <div className="p-4 border border-[var(--border-subtle)] space-y-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-white border-b border-[var(--border-subtle)] pb-2">
            Storage Parameters
          </div>
          
          <div>
            <label className="block text-[10px] uppercase text-[var(--text-tertiary)] mb-1">Storage Key</label>
            <input
              type="text"
              value={data.destination || ''}
              onChange={(e) => onUpdate({ destination: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] text-xs text-white focus:border-white focus:outline-none font-mono"
              placeholder="workflow_result"
            />
          </div>
        </div>
      )}

      {data.actionType === 'blockchain' && (
        <div className="p-4 border border-[var(--border-subtle)] space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-white border-b border-[var(--border-subtle)] pb-2">
            Chain Parameters
          </div>
          
          <div className="flex items-center gap-2 text-[10px] text-white font-mono">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span>SOLANA DEVNET CONNECTED</span>
          </div>
        </div>
      )}

      {/* End Node indicator */}
      <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-app)] flex items-center gap-3">
        <div className="w-1.5 h-1.5 bg-white" />
        <span className="text-[10px] uppercase tracking-widest text-white">End of Sequence</span>
      </div>
    </div>
  );
}
