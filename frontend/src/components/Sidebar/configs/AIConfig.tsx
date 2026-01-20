'use client';

import React from 'react';
import { AINodeData } from '@/types/workflow';

interface AIConfigProps {
  data: AINodeData;
  onUpdate: (data: Partial<AINodeData>) => void;
}

const models = [
  // Hugging Face
  { id: 'gpt2', name: 'GPT-2', provider: 'huggingface' },
  { id: 'distilbert-base-uncased', name: 'DistilBERT', provider: 'huggingface' },
  { id: 'facebook/bart-large-cnn', name: 'BART (Summarization)', provider: 'huggingface' },
  // OpenRouter
  { id: 'openai/gpt-oss-120b:free', name: 'GPT-OSS 120B (Free)', provider: 'openrouter' },
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Free)', provider: 'openrouter' },
  { id: 'google/gemma-2-9b-it:free', name: 'Gemma 2 9B (Free)', provider: 'openrouter' },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free)', provider: 'openrouter' },
  // Groq
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', provider: 'groq' },
  { id: 'llama2-70b-4096', name: 'Llama 2 70B', provider: 'groq' },
];

export default function AIConfig({ data, onUpdate }: AIConfigProps) {
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

      {/* AI Provider */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
          Provider
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['huggingface', 'openrouter', 'groq'].map((provider) => {
            const firstModelForProvider = models.find(m => m.provider === provider);
            return (
              <button
                key={provider}
                onClick={() => onUpdate({ 
                  model: provider as 'huggingface' | 'openrouter' | 'groq',
                  modelId: firstModelForProvider?.id || ''
                })}
                className={`
                  py-2 px-3 border text-[10px] font-mono uppercase tracking-wide transition-all
                  ${data.model === provider
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-white hover:border-white'
                  }
                `}
              >
                {provider}
              </button>
            );
          })}
        </div>
      </div>

      {/* Model Selection */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
          Model
        </label>
        <select
          value={data.modelId}
          onChange={(e) => onUpdate({ modelId: e.target.value })}
          className="w-full px-3 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] text-sm text-white focus:border-white focus:outline-none transition-colors font-mono appearance-none rounded-none"
        >
          {models
            .filter((m) => m.provider === data.model)
            .map((model) => (
              <option key={model.id} value={model.id} className="bg-black">
                {model.name}
              </option>
            ))}
        </select>
      </div>

      {/* System Prompt */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
          System Prompt
        </label>
        <textarea
          value={data.systemPrompt || ''}
          onChange={(e) => onUpdate({ systemPrompt: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] focus:text-white focus:border-white focus:outline-none transition-colors resize-none font-mono"
          placeholder="SYSTEM INSTRUCTIONS..."
        />
      </div>

      {/* User Prompt */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
          User Prompt
        </label>
        <textarea
          value={data.userPrompt}
          onChange={(e) => onUpdate({ userPrompt: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] focus:text-white focus:border-white focus:outline-none transition-colors resize-none font-mono"
          placeholder="INPUT TEMPLATE..."
        />
        <p className="mt-1 text-[9px] text-[var(--text-tertiary)] font-mono">
          Use {"{{input}}"} to reference previous data
        </p>
      </div>

      {/* Advanced Settings */}
      <div className="p-4 border border-[var(--border-subtle)] space-y-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-white border-b border-[var(--border-subtle)] pb-2">
          Advanced Parameters
        </div>
        
        {/* Temperature */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] uppercase text-[var(--text-tertiary)]">
              Temperature
            </label>
            <span className="text-[10px] text-white font-mono">{data.temperature ?? 0.7}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={data.temperature ?? 0.7}
            onChange={(e) => onUpdate({ temperature: parseFloat(e.target.value) })}
            className="w-full h-1 bg-[var(--border-subtle)] appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white rounded-none"
          />
        </div>

        {/* Max Tokens */}
        <div>
          <label className="block text-[10px] uppercase text-[var(--text-tertiary)] mb-1">
            Max Tokens
          </label>
          <input
            type="number"
            value={data.maxTokens ?? 100}
            onChange={(e) => onUpdate({ maxTokens: parseInt(e.target.value) })}
            min={10}
            max={4000}
            className="w-full px-2 py-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] text-xs text-white focus:border-white focus:outline-none font-mono"
          />
        </div>
      </div>

      {/* API Key */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
          API Key (Optional)
        </label>
        <input
          type="password"
          value={data.apiKey || ''}
          onChange={(e) => onUpdate({ apiKey: e.target.value })}
          className="w-full px-3 py-2 bg-[var(--bg-app)] border-b border-[var(--border-subtle)] text-xs text-white focus:border-white focus:outline-none transition-colors font-mono"
          placeholder="OVERRIDE DEFAULT KEY..."
        />
      </div>
    </div>
  );
}
