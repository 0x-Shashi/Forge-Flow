'use client';

import React from 'react';
import { useWorkflowStore } from '@/stores/workflowStore';
import { 
  NodeType, 
  TriggerNodeData, 
  APINodeData, 
  AINodeData, 
  LogicNodeData, 
  ActionNodeData 
} from '@/types/workflow';
import TriggerConfig from './configs/TriggerConfig';
import APIConfig from './configs/APIConfig';
import AIConfig from './configs/AIConfig';
import LogicConfig from './configs/LogicConfig';
import ActionConfig from './configs/ActionConfig';

const nodeLabels: Record<NodeType, string> = {
  trigger: 'TRIGGER CONFIG',
  api: 'API CONFIG',
  ai: 'AI MODEL CONFIG',
  logic: 'LOGIC GATE CONFIG',
  action: 'ACTION CONFIG',
};

export default function ConfigPanel() {
  const { selectedNode, isConfigPanelOpen, setConfigPanelOpen, updateNodeData } = useWorkflowStore();

  if (!isConfigPanelOpen || !selectedNode) return null;

  const nodeType = selectedNode.type as NodeType;

  const handleClose = () => {
    setConfigPanelOpen(false);
  };

  const handleUpdate = (data: Record<string, unknown>) => {
    updateNodeData(selectedNode.id, data);
  };

  const renderConfigForm = () => {
    switch (nodeType) {
      case 'trigger':
        return <TriggerConfig data={selectedNode.data as TriggerNodeData} onUpdate={handleUpdate} />;
      case 'api':
        return <APIConfig data={selectedNode.data as APINodeData} onUpdate={handleUpdate} />;
      case 'ai':
        return <AIConfig data={selectedNode.data as AINodeData} onUpdate={handleUpdate} />;
      case 'logic':
        return <LogicConfig data={selectedNode.data as LogicNodeData} onUpdate={handleUpdate} />;
      case 'action':
        return <ActionConfig data={selectedNode.data as ActionNodeData} onUpdate={handleUpdate} />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/50"
        onClick={handleClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-[400px] bg-[var(--bg-panel)] border-l border-[var(--border-subtle)] z-50 flex flex-col shadow-2xl animate-slide-in">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold tracking-[0.1em] text-white uppercase font-mono">
              {nodeLabels[nodeType]}
            </h2>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-1 font-mono">
              ID: {selectedNode.id.slice(0, 8)}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-[var(--text-tertiary)] hover:text-white px-2 py-1 border border-transparent hover:border-[var(--border-light)] transition-all text-xs font-mono"
          >
            [CLOSE]
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderConfigForm()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--border-subtle)]">
          <button
            onClick={handleClose}
            className="btn-premium-primary w-full"
          >
            APPLY CHANGES
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
