'use client';

import React from 'react';
import { TriggerNodeData } from '@/types/workflow';

interface TriggerConfigProps {
  data: TriggerNodeData;
  onUpdate: (data: Partial<TriggerNodeData>) => void;
}

export default function TriggerConfig({ data, onUpdate }: TriggerConfigProps) {
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

      {/* Trigger Type */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
          Trigger Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'manual', label: 'MANUAL' },
            { value: 'time', label: 'SCHEDULE' },
            { value: 'event', label: 'EVENT' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => onUpdate({ triggerType: option.value as 'manual' | 'time' | 'event' })}
              className={`
                flex flex-col items-center gap-1 p-2 border transition-all
                ${data.triggerType === option.value
                  ? 'bg-white border-white text-black'
                  : 'bg-transparent border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-white hover:text-white'
                }
              `}
            >
              <span className="text-[10px] font-mono font-bold tracking-wider">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Time-based settings */}
      {data.triggerType === 'time' && (
        <div className="p-4 border border-[var(--border-subtle)] space-y-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-white border-b border-[var(--border-subtle)] pb-2">
            Schedule Parameters
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[10px] uppercase text-[var(--text-tertiary)] mb-1">Interval</label>
              <input
                type="number"
                value={data.interval || 5}
                onChange={(e) => onUpdate({ interval: parseInt(e.target.value) })}
                min={1}
                className="w-full px-2 py-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] text-xs text-white focus:border-white focus:outline-none font-mono"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] uppercase text-[var(--text-tertiary)] mb-1">Unit</label>
              <select
                value={data.intervalUnit || 'minutes'}
                onChange={(e) => onUpdate({ intervalUnit: e.target.value as 'minutes' | 'hours' | 'days' })}
                className="w-full px-2 py-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] text-xs text-white focus:border-white focus:outline-none font-mono appearance-none rounded-none"
              >
                <option value="minutes">MINUTES</option>
                <option value="hours">HOURS</option>
                <option value="days">DAYS</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Event-based settings */}
      {data.triggerType === 'event' && (
        <div className="p-4 border border-[var(--border-subtle)] space-y-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-white border-b border-[var(--border-subtle)] pb-2">
            Event Parameters
          </div>
          
          <div>
            <label className="block text-[10px] uppercase text-[var(--text-tertiary)] mb-1">Event Condition</label>
            <input
              type="text"
              value={data.eventCondition || ''}
              onChange={(e) => onUpdate({ eventCondition: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] text-xs text-white focus:border-white focus:outline-none transition-colors font-mono"
              placeholder="E.G., ON_TX_CONFIRMED"
            />
          </div>
        </div>
      )}
    </div>
  );
}
