'use client';

import React, { useCallback, useRef, DragEvent } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  ReactFlowInstance,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useWorkflowStore } from '@/stores/workflowStore';
import { NodeType } from '@/types/workflow';

// Import custom node types
import TriggerNode from './NodeTypes/TriggerNode';
import APINode from './NodeTypes/APINode';
import AINode from './NodeTypes/AINode';
import LogicNode from './NodeTypes/LogicNode';
import ActionNode from './NodeTypes/ActionNode';

// Register custom node types
const nodeTypes = {
  trigger: TriggerNode,
  api: APINode,
  ai: AINode,
  logic: LogicNode,
  action: ActionNode,
};

function WorkflowCanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = React.useState<ReactFlowInstance | null>(null);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    selectNode,
    deleteSelectedNodes,
  } = useWorkflowStore();

  // Handle drag over for node dropping
  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle node drop from sidebar
  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      addNode(type, position);
    },
    [reactFlowInstance, addNode]
  );

  // Handle node click to open config panel
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      const foundNode = nodes.find((n) => n.id === node.id);
      if (foundNode) {
        selectNode(foundNode);
      }
    },
    [nodes, selectNode]
  );

  // Handle pane click to close config panel
  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  // Handle keyboard shortcuts
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        deleteSelectedNodes();
      }
    },
    [deleteSelectedNodes]
  );

  return (
    <div
      ref={reactFlowWrapper}
      className="w-full h-full relative bg-[#050508]"
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { 
            stroke: '#ffffff', 
            strokeWidth: 1,
          },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="rgba(100, 100, 100, 0.2)"
        />
        <Controls
          showInteractive={false}
          position="bottom-left"
          className="!bg-black !border !border-white/10 !shadow-none [&>button]:!bg-black [&>button]:!border-b [&>button]:!border-white/10 [&>button:last-child]:!border-b-0 [&>button]:!text-gray-400 [&>button:hover]:!text-white [&>button:hover]:!bg-white/5"
        />
        <MiniMap
          nodeStrokeWidth={0}
          pannable
          zoomable
          nodeColor={(node) => {
             return '#333333'; // All nodes dark grey in minimap
          }}
          maskColor="rgba(5, 5, 8, 0.85)"
          className="!bg-black !border !border-white/10"
        />
      </ReactFlow>

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border border-[var(--border-subtle)] flex items-center justify-center">
              <span className="text-2xl font-mono text-[var(--text-tertiary)]">+</span>
            </div>
            <h3 className="text-sm font-bold tracking-[0.2em] text-white uppercase font-mono mb-2">Initialize Workflow</h3>
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">
              Drag components from sidebar
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap with ReactFlowProvider
export default function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner />
    </ReactFlowProvider>
  );
}
