import { create } from 'zustand';
import { 
  Node, 
  Edge, 
  OnNodesChange, 
  OnEdgesChange, 
  OnConnect, 
  applyNodeChanges, 
  applyEdgeChanges, 
  addEdge,
  Connection 
} from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import { NodeType, WorkflowNodeData, Workflow } from '@/types/workflow';

interface WorkflowState {
  // Current workflow
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  workflowName: string;
  workflowId: string | null;
  
  // Selected node for config panel
  selectedNode: Node<WorkflowNodeData> | null;
  
  // UI state
  isConfigPanelOpen: boolean;
  isExecuting: boolean;
  
  // Saved workflows
  savedWorkflows: Workflow[];
  
  // Actions
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
  deleteSelectedNodes: () => void;
  
  selectNode: (node: Node<WorkflowNodeData> | null) => void;
  setConfigPanelOpen: (isOpen: boolean) => void;
  
  setWorkflowName: (name: string) => void;
  saveWorkflow: () => void;
  loadWorkflow: (workflow: Workflow) => void;
  clearWorkflow: () => void;
  
  setExecuting: (isExecuting: boolean) => void;
  updateNodeExecutionState: (nodeId: string, state: { isExecuting?: boolean; isSuccess?: boolean; isError?: boolean; output?: unknown }) => void;
}

// Default data for each node type
const getDefaultNodeData = (type: NodeType): WorkflowNodeData => {
  switch (type) {
    case 'trigger':
      return {
        label: 'Trigger',
        description: 'Start workflow',
        triggerType: 'manual',
        interval: 5,
        intervalUnit: 'minutes',
      };
    case 'api':
      return {
        label: 'API Call',
        description: 'Fetch data',
        url: '',
        method: 'GET',
        headers: {},
      };
    case 'ai':
      return {
        label: 'AI Processing',
        description: 'Process with AI',
        model: 'huggingface',
        modelId: 'gpt2',
        userPrompt: '',
        temperature: 0.7,
        maxTokens: 100,
      };
    case 'logic':
      return {
        label: 'Condition',
        description: 'If/Else logic',
        condition: '',
        operator: 'equals',
        value: '',
      };
    case 'action':
      return {
        label: 'Action',
        description: 'Perform action',
        actionType: 'save',
      };
  }
};

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // Initial state
  nodes: [],
  edges: [],
  workflowName: 'Untitled Workflow',
  workflowId: null,
  selectedNode: null,
  isConfigPanelOpen: false,
  isExecuting: false,
  savedWorkflows: [],

  // Node changes (move, select, etc.)
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  // Edge changes
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  // Connect nodes
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(
        {
          ...connection,
          type: 'smoothstep',
          animated: true,
        },
        get().edges
      ),
    });
  },

  // Add a new node
  addNode: (type, position) => {
    const newNode: Node<WorkflowNodeData> = {
      id: uuidv4(),
      type,
      position,
      data: getDefaultNodeData(type),
    };
    
    set({
      nodes: [...get().nodes, newNode],
    });
  },

  // Update node data
  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
      selectedNode:
        get().selectedNode?.id === nodeId
          ? { ...get().selectedNode!, data: { ...get().selectedNode!.data, ...data } }
          : get().selectedNode,
    });
  },

  // Delete selected nodes
  deleteSelectedNodes: () => {
    const selectedNodeIds = get().nodes
      .filter((node) => node.selected)
      .map((node) => node.id);
    
    set({
      nodes: get().nodes.filter((node) => !node.selected),
      edges: get().edges.filter(
        (edge) =>
          !selectedNodeIds.includes(edge.source) &&
          !selectedNodeIds.includes(edge.target)
      ),
      selectedNode: null,
      isConfigPanelOpen: false,
    });
  },

  // Select a node
  selectNode: (node) => {
    set({
      selectedNode: node,
      isConfigPanelOpen: node !== null,
    });
  },

  // Toggle config panel
  setConfigPanelOpen: (isOpen) => {
    set({ isConfigPanelOpen: isOpen });
  },

  // Set workflow name
  setWorkflowName: (name) => {
    set({ workflowName: name });
  },

  // Save current workflow
  saveWorkflow: () => {
    const { nodes, edges, workflowName, workflowId, savedWorkflows } = get();
    
    const workflow: Workflow = {
      id: workflowId || uuidv4(),
      name: workflowName,
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type as NodeType,
        position: node.position,
        data: node.data,
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle || undefined,
        targetHandle: edge.targetHandle || undefined,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update or add workflow
    const existingIndex = savedWorkflows.findIndex((w) => w.id === workflow.id);
    let newSavedWorkflows: Workflow[];
    
    if (existingIndex >= 0) {
      newSavedWorkflows = [...savedWorkflows];
      newSavedWorkflows[existingIndex] = workflow;
    } else {
      newSavedWorkflows = [...savedWorkflows, workflow];
    }

    set({
      workflowId: workflow.id,
      savedWorkflows: newSavedWorkflows,
    });

    // Also save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('forgeflow-workflows', JSON.stringify(newSavedWorkflows));
    }
  },

  // Load a workflow
  loadWorkflow: (workflow) => {
    set({
      workflowId: workflow.id,
      workflowName: workflow.name,
      nodes: workflow.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
      })),
      edges: workflow.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: 'smoothstep',
        animated: true,
      })),
      selectedNode: null,
      isConfigPanelOpen: false,
    });
  },

  // Clear workflow
  clearWorkflow: () => {
    set({
      nodes: [],
      edges: [],
      workflowName: 'Untitled Workflow',
      workflowId: null,
      selectedNode: null,
      isConfigPanelOpen: false,
    });
  },

  // Set executing state
  setExecuting: (isExecuting) => {
    set({ isExecuting });
  },

  // Update node execution state
  updateNodeExecutionState: (nodeId, state) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...state } }
          : node
      ),
    });
  },
}));
