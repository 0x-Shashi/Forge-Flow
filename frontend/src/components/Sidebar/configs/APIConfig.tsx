'use client';

import React, { useState } from 'react';
import { APINodeData } from '@/types/workflow';

interface APIConfigProps {
  data: APINodeData;
  onUpdate: (data: Partial<APINodeData>) => void;
}

export default function APIConfig({ data, onUpdate }: APIConfigProps) {
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>(
    Object.entries(data.headers || {}).map(([key, value]) => ({ key, value }))
  );
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const methods = ['GET', 'POST', 'PUT', 'DELETE'] as const;

  const updateHeaders = (newHeaders: { key: string; value: string }[]) => {
    setHeaders(newHeaders);
    const headerObj: Record<string, string> = {};
    newHeaders.forEach(({ key, value }) => {
      if (key.trim()) headerObj[key] = value;
    });
    onUpdate({ headers: headerObj });
  };

  const addHeader = () => {
    updateHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (index: number) => {
    updateHeaders(headers.filter((_, i) => i !== index));
  };

  const testAPI = async () => {
    if (!data.url) {
      setTestResult({ success: false, message: 'URL REQUIRED' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(data.url, {
        method: data.method,
        headers: data.headers,
      });
      
      if (response.ok) {
        setTestResult({ success: true, message: `SUCCESS: ${response.status}` });
      } else {
        setTestResult({ success: false, message: `ERROR: ${response.status}` });
      }
    } catch (error) {
      setTestResult({ success: false, message: 'NETWORK ERROR' });
    }

    setIsTesting(false);
  };

  return (
    <div className="space-y-6">
      {/* Node Label */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Node Label</label>
        <input
          type="text"
          value={data.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="w-full px-3 py-2 bg-[var(--bg-app)] border-b border-[var(--border-subtle)] text-sm text-white focus:border-white focus:outline-none transition-colors font-mono"
          placeholder="ENTER LABEL..."
        />
      </div>

      {/* HTTP Method */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-2">HTTP Method</label>
        <div className="grid grid-cols-4 gap-2">
          {methods.map((method) => (
            <button
              key={method}
              onClick={() => onUpdate({ method })}
              className={`
                py-2 border text-[10px] font-mono font-bold transition-all
                ${data.method === method
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-white hover:text-white'
                }
              `}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      {/* URL */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Endpoint URL</label>
        <input
          type="text"
          value={data.url}
          onChange={(e) => onUpdate({ url: e.target.value })}
          className="w-full px-3 py-2 bg-[var(--bg-app)] border-b border-[var(--border-subtle)] text-xs text-white focus:border-white focus:outline-none transition-colors font-mono"
          placeholder="HTTPS://API.EXAMPLE.COM..."
        />
      </div>

      {/* Headers */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">Headers</label>
          <button
            onClick={addHeader}
            className="text-[10px] uppercase text-[var(--text-secondary)] hover:text-white border border-transparent hover:border-[var(--border-subtle)] px-2 py-0.5 transition-all"
          >
            + ADD HEADER
          </button>
        </div>
        
        <div className="space-y-2">
          {headers.map((header, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={header.key}
                onChange={(e) => {
                  const newHeaders = [...headers];
                  newHeaders[index].key = e.target.value;
                  updateHeaders(newHeaders);
                }}
                className="flex-1 px-2 py-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[10px] text-white focus:border-white focus:outline-none font-mono"
                placeholder="KEY"
              />
              <input
                type="text"
                value={header.value}
                onChange={(e) => {
                  const newHeaders = [...headers];
                  newHeaders[index].value = e.target.value;
                  updateHeaders(newHeaders);
                }}
                className="flex-1 px-2 py-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[10px] text-white focus:border-white focus:outline-none font-mono"
                placeholder="VALUE"
              />
              <button
                onClick={() => removeHeader(index)}
                className="px-2 border border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:text-white hover:border-white transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Request Body */}
      {(data.method === 'POST' || data.method === 'PUT') && (
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Request Body (JSON)</label>
          <textarea
            value={data.body || ''}
            onChange={(e) => onUpdate({ body: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] focus:text-white focus:border-white focus:outline-none transition-colors resize-none font-mono"
            placeholder='{"KEY": "VALUE"}'
          />
        </div>
      )}

      {/* Test API Button */}
      <div className="pt-4 border-t border-[var(--border-subtle)]">
        <button
          onClick={testAPI}
          disabled={isTesting}
          className="w-full py-2 btn-premium-primary disabled:opacity-50"
        >
          {isTesting ? 'TESTING...' : 'TEST REQUEST'}
        </button>
        
        {testResult && (
          <div className={`mt-3 p-3 border text-xs font-mono uppercase ${
            testResult.success 
              ? 'border-white text-white'
              : 'border-red-500 text-red-500'
          }`}>
            {testResult.message}
          </div>
        )}
      </div>
    </div>
  );
}
