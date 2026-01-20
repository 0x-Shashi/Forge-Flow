import { Node, Edge } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import { 
  Workflow, 
  WorkflowNode, 
  WorkflowEdge, 
  WorkflowNodeData, 
  NodeType 
} from '@/types/workflow';

/**
 * Serialize React Flow nodes and edges to a workflow JSON object
 */
export function serializeWorkflow(
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[],
  name: string = 'Untitled Workflow',
  existingId?: string
): Workflow {
  const workflow: Workflow = {
    id: existingId || uuidv4(),
    name,
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

  return workflow;
}

/**
 * Deserialize a workflow JSON object back to React Flow format
 */
export function deserializeWorkflow(workflow: Workflow): {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
} {
  return {
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
  };
}

/**
 * Validate a workflow for execution
 */
export function validateWorkflow(workflow: Workflow): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check if workflow has nodes
  if (workflow.nodes.length === 0) {
    errors.push('Workflow has no nodes');
    return { valid: false, errors };
  }

  // Check for trigger nodes - OMITTED to allow manual runs
  // const triggerNodes = workflow.nodes.filter((node) => node.type === 'trigger');
  // if (triggerNodes.length === 0) {
  //   errors.push('Workflow must have at least one Trigger node');
  // }

  // Build adjacency list for graph traversal
  const adjacencyList = new Map<string, string[]>();
  const incomingEdges = new Map<string, number>();

  workflow.nodes.forEach((node) => {
    adjacencyList.set(node.id, []);
    incomingEdges.set(node.id, 0);
  });

  workflow.edges.forEach((edge) => {
    const targets = adjacencyList.get(edge.source) || [];
    targets.push(edge.target);
    adjacencyList.set(edge.source, targets);
    incomingEdges.set(edge.target, (incomingEdges.get(edge.target) || 0) + 1);
  });

  // Check for disconnected nodes (nodes with no edges except triggers)
  workflow.nodes.forEach((node) => {
    if (node.type !== 'trigger') {
      const hasIncoming = (incomingEdges.get(node.id) || 0) > 0;
      const hasOutgoing = (adjacencyList.get(node.id) || []).length > 0;
      
      // Action nodes don't need outgoing edges
      if (node.type !== 'action' && !hasOutgoing && !hasIncoming) {
        errors.push(`Node "${node.data.label}" is disconnected`);
      }
    }
  });

  // Check for cycles using DFS
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycle(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of workflow.nodes) {
    if (!visited.has(node.id)) {
      if (hasCycle(node.id)) {
        errors.push('Workflow contains a cycle (loops are not allowed)');
        break;
      }
    }
  }

  // Validate node configurations
  workflow.nodes.forEach((node) => {
    switch (node.type) {
      case 'api':
        if (!('url' in node.data && node.data.url)) {
          errors.push(`API node "${node.data.label}" is missing URL`);
        }
        break;
      case 'ai':
        if (!('userPrompt' in node.data && node.data.userPrompt)) {
          errors.push(`AI node "${node.data.label}" is missing prompt`);
        }
        break;
      case 'logic':
        if (!('condition' in node.data && node.data.condition)) {
          errors.push(`Logic node "${node.data.label}" is missing condition`);
        }
        break;
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get topological order of nodes for execution
 */
export function getTopologicalOrder(workflow: Workflow): WorkflowNode[] {
  const adjacencyList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  const nodeMap = new Map<string, WorkflowNode>();

  // Initialize
  workflow.nodes.forEach((node) => {
    adjacencyList.set(node.id, []);
    inDegree.set(node.id, 0);
    nodeMap.set(node.id, node);
  });

  // Build graph
  workflow.edges.forEach((edge) => {
    const targets = adjacencyList.get(edge.source) || [];
    targets.push(edge.target);
    adjacencyList.set(edge.source, targets);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });

  // Kahn's algorithm
  const queue: string[] = [];
  const result: WorkflowNode[] = [];

  // Start with nodes that have no incoming edges (triggers)
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId);
    }
  });

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodeMap.get(nodeId);
    if (node) result.push(node);

    const neighbors = adjacencyList.get(nodeId) || [];
    neighbors.forEach((neighbor) => {
      const newDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) {
        queue.push(neighbor);
      }
    });
  }

  return result;
}

/**
 * Export workflow as JSON string
 */
export function exportWorkflow(workflow: Workflow): string {
  return JSON.stringify(workflow, null, 2);
}

/**
 * Import workflow from JSON string
 */
export function importWorkflow(jsonString: string): Workflow | null {
  try {
    const workflow = JSON.parse(jsonString) as Workflow;
    
    // Basic validation
    if (!workflow.id || !workflow.nodes || !workflow.edges) {
      throw new Error('Invalid workflow format');
    }
    
    return workflow;
  } catch (error) {
    console.error('Failed to import workflow:', error);
    return null;
  }
}
