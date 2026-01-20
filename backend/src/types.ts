export type NodeType = 'trigger' | 'api' | 'ai' | 'logic' | 'action';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ExecutionResult {
  nodeId: string;
  success: boolean;
  output?: any;
  error?: string;
  duration: number;
}

export interface WorkflowExecution {
  workflowId: string;
  executionId: string;
  status: 'running' | 'completed' | 'failed';
  results: ExecutionResult[];
  startedAt: string;
  completedAt?: string;
}
