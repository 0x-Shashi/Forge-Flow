import { Workflow } from './types';

/**
 * Validate a workflow before execution
 */
export function validateWorkflow(workflow: Workflow): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check if workflow exists
  if (!workflow) {
    errors.push('Workflow is required');
    return { valid: false, errors };
  }

  // Check if workflow has nodes
  if (!workflow.nodes || workflow.nodes.length === 0) {
    errors.push('Workflow must have at least one node');
    return { valid: false, errors };
  }

  // Check for trigger nodes
  const triggerNodes = workflow.nodes.filter((node) => node.type === 'trigger');
  if (triggerNodes.length === 0) {
    errors.push('Workflow must have at least one Trigger node');
  }

  // Build adjacency list
  const adjacencyList = new Map<string, string[]>();
  const incomingEdges = new Map<string, number>();

  workflow.nodes.forEach((node) => {
    adjacencyList.set(node.id, []);
    incomingEdges.set(node.id, 0);
  });

  workflow.edges?.forEach((edge) => {
    const targets = adjacencyList.get(edge.source) || [];
    targets.push(edge.target);
    adjacencyList.set(edge.source, targets);
    incomingEdges.set(edge.target, (incomingEdges.get(edge.target) || 0) + 1);
  });

  // Check for disconnected non-trigger nodes
  workflow.nodes.forEach((node) => {
    if (node.type !== 'trigger') {
      const hasIncoming = (incomingEdges.get(node.id) || 0) > 0;
      const hasOutgoing = (adjacencyList.get(node.id) || []).length > 0;

      if (node.type !== 'action' && !hasOutgoing && !hasIncoming) {
        errors.push(`Node "${node.data?.label || node.id}" is disconnected`);
      }
    }
  });

  // Check for cycles
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
    if (!visited.has(node.id) && hasCycle(node.id)) {
      errors.push('Workflow contains a cycle (loops are not allowed)');
      break;
    }
  }

  // Validate node configurations
  workflow.nodes.forEach((node) => {
    const data = node.data || {};
    
    switch (node.type) {
      case 'api':
        if (!data.url) {
          errors.push(`API node "${data.label || node.id}" is missing URL`);
        }
        break;
      case 'ai':
        if (!data.userPrompt) {
          errors.push(`AI node "${data.label || node.id}" is missing prompt`);
        }
        break;
      case 'logic':
        if (!data.condition) {
          errors.push(`Logic node "${data.label || node.id}" is missing condition`);
        }
        break;
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
