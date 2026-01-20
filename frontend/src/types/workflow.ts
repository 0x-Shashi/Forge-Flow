// Node Types for the workflow builder

export type NodeType = "trigger" | "api" | "ai" | "logic" | "action";

export interface NodePosition {
  x: number;
  y: number;
}

// Base node data interface
export interface BaseNodeData {
  label: string;
  description?: string;
  isExecuting?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  output?: unknown;
}

// Trigger Node
export interface TriggerNodeData extends BaseNodeData {
  triggerType: "time" | "event" | "manual";
  interval?: number; // in minutes
  intervalUnit?: "minutes" | "hours" | "days";
  eventCondition?: string;
}

// API Node
export interface APINodeData extends BaseNodeData {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: string;
}

// AI Node
export interface AINodeData extends BaseNodeData {
  model: "huggingface" | "openrouter" | "groq";
  modelId: string;
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
}

// Logic Node
export interface LogicNodeData extends BaseNodeData {
  condition: string;
  operator: "equals" | "contains" | "greater" | "less" | "exists";
  value: string;
}

// Action Node
export interface ActionNodeData extends BaseNodeData {
  actionType: "save" | "notify" | "webhook" | "blockchain";
  destination?: string;
  webhookUrl?: string;
}

// Union type for all node data
export type WorkflowNodeData =
  | TriggerNodeData
  | APINodeData
  | AINodeData
  | LogicNodeData
  | ActionNodeData;

// Workflow Edge
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
}

// Complete Workflow
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
  owner?: string; // Solana wallet address
}

// Workflow Node combines React Flow node data with our custom data
export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: NodePosition;
  data: WorkflowNodeData;
}

// Execution Result
export interface ExecutionResult {
  nodeId: string;
  success: boolean;
  output?: unknown;
  error?: string;
  timestamp: string;
  duration: number;
}

// Workflow Execution State
export interface WorkflowExecution {
  workflowId: string;
  executionId: string;
  status: "pending" | "running" | "completed" | "failed";
  results: ExecutionResult[];
  startedAt: string;
  completedAt?: string;
}
