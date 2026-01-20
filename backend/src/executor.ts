import { Workflow, WorkflowExecution, WorkflowNode } from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Execute a complete workflow on the server
 */
export async function executeWorkflow(workflow: Workflow): Promise<WorkflowExecution> {
  const executionId = uuidv4();
  const startTime = new Date();
  const results: any[] = [];
  const context: Record<string, any> = {};

  // Get topological order
  const orderedNodes = getTopologicalOrder(workflow);

  // Build edge map
  const edgeMap = new Map<string, string[]>();
  workflow.edges.forEach((edge) => {
    const sources = edgeMap.get(edge.target) || [];
    sources.push(edge.source);
    edgeMap.set(edge.target, sources);
  });

  // Execute each node
  for (const node of orderedNodes) {
    const inputNodeIds = edgeMap.get(node.id) || [];
    const inputs = inputNodeIds.map((id) => context[id]);
    const inputData = inputs.length === 1 ? inputs[0] : inputs;

    const nodeStart = Date.now();

    try {
      const output = await executeNode(node, inputData);
      context[node.id] = output;

      results.push({
        nodeId: node.id,
        success: true,
        output,
        duration: Date.now() - nodeStart,
      });
    } catch (error) {
      results.push({
        nodeId: node.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - nodeStart,
      });
      context[node.id] = null;
    }
  }

  return {
    workflowId: workflow.id,
    executionId,
    status: results.every((r) => r.success) ? 'completed' : 'failed',
    results,
    startedAt: startTime.toISOString(),
    completedAt: new Date().toISOString(),
  };
}

/**
 * Execute a single node
 */
async function executeNode(node: WorkflowNode, inputData: any): Promise<any> {
  switch (node.type) {
    case 'trigger':
      return { triggered: true, timestamp: new Date().toISOString() };

    case 'api':
      return await executeAPINode(node.data, inputData);

    case 'ai':
      return await executeAINode(node.data, inputData);

    case 'logic':
      return executeLogicNode(node.data, inputData);

    case 'action':
      return executeActionNode(node.data, inputData);

    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
}

/**
 * Execute API node
 */
async function executeAPINode(data: any, input: any): Promise<any> {
  if (!data.url) throw new Error('API URL is required');

  let url = data.url;
  if (input && typeof input === 'object') {
    url = replaceTemplateVars(url, input);
  }

  const response = await fetch(url, {
    method: data.method || 'GET',
    headers: data.headers || {},
    body: data.method === 'POST' || data.method === 'PUT' ? data.body : undefined,
  });

  const contentType = response.headers.get('content-type');
  const responseData = contentType?.includes('json') 
    ? await response.json() 
    : await response.text();

  return { status: response.status, data: responseData };
}

/**
 * Execute AI node (Hugging Face)
 */
async function executeAINode(data: any, input: any): Promise<any> {
  let prompt = data.userPrompt || '';
  if (input && typeof input === 'object') {
    prompt = replaceTemplateVars(prompt, input);
  }

  const token = process.env.HF_TOKEN;
  if (!token) {
    return { simulated: true, response: `[Demo] AI would process: "${prompt.slice(0, 50)}..."` };
  }

  const response = await fetch(
    `https://api-inference.huggingface.co/models/${data.modelId || 'gpt2'}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt }),
    }
  );

  return { model: data.modelId, response: await response.json() };
}

/**
 * Execute Logic node
 */
function executeLogicNode(data: any, input: any): any {
  const value = getNestedValue(input, data.condition || '');
  let result = false;

  switch (data.operator) {
    case 'equals': result = value == data.value; break;
    case 'contains': result = String(value).includes(data.value); break;
    case 'greater': result = Number(value) > Number(data.value); break;
    case 'less': result = Number(value) < Number(data.value); break;
    case 'exists': result = value !== undefined && value !== null; break;
  }

  return { condition: data.condition, result, path: result ? 'true' : 'false', input };
}

/**
 * Execute Action node
 */
function executeActionNode(data: any, input: any): any {
  switch (data.actionType) {
    case 'save':
      return { saved: true, key: data.destination, data: input };
    case 'notify':
      console.log('📢 Notification:', input);
      return { notified: true, input };
    case 'webhook':
      return { webhook: data.webhookUrl, input };
    case 'blockchain':
      return { blockchain: true, data: input };
    default:
      return { action: data.actionType, input };
  }
}

/**
 * Get topological order
 */
function getTopologicalOrder(workflow: Workflow): WorkflowNode[] {
  const adjacencyList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  const nodeMap = new Map<string, WorkflowNode>();

  workflow.nodes.forEach((node) => {
    adjacencyList.set(node.id, []);
    inDegree.set(node.id, 0);
    nodeMap.set(node.id, node);
  });

  workflow.edges.forEach((edge) => {
    const targets = adjacencyList.get(edge.source) || [];
    targets.push(edge.target);
    adjacencyList.set(edge.source, targets);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });

  const queue: string[] = [];
  const result: WorkflowNode[] = [];

  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) queue.push(nodeId);
  });

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodeMap.get(nodeId);
    if (node) result.push(node);

    (adjacencyList.get(nodeId) || []).forEach((neighbor) => {
      const newDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    });
  }

  return result;
}

// Helpers
function replaceTemplateVars(template: string, data: any): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    const value = getNestedValue(data, key.trim());
    return value !== undefined ? String(value) : '';
  });
}

function getNestedValue(obj: any, path: string): any {
  if (!obj || typeof obj !== 'object') return undefined;
  return path.split('.').reduce((curr, key) => curr?.[key], obj);
}
