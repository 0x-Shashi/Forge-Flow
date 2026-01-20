import { 
  WorkflowNode, 
  Workflow, 
  ExecutionResult, 
  WorkflowExecution,
  TriggerNodeData,
  APINodeData,
  AINodeData,
  LogicNodeData,
  ActionNodeData
} from '@/types/workflow';
import { getTopologicalOrder } from './workflowSerializer';
import { v4 as uuidv4 } from 'uuid';

// Type for execution context that passes data between nodes
interface ExecutionContext {
  [nodeId: string]: unknown;
}

// Callback for updating node UI state during execution
type NodeStateCallback = (
  nodeId: string, 
  state: { isExecuting?: boolean; isSuccess?: boolean; isError?: boolean; output?: unknown }
) => void;

/**
 * Execute a complete workflow
 */
export async function executeWorkflow(
  workflow: Workflow,
  onNodeStateChange?: NodeStateCallback
): Promise<WorkflowExecution> {
  const executionId = uuidv4();
  const startTime = new Date();
  const results: ExecutionResult[] = [];
  const context: ExecutionContext = {};

  const execution: WorkflowExecution = {
    workflowId: workflow.id,
    executionId,
    status: 'running',
    results: [],
    startedAt: startTime.toISOString(),
  };

  try {
    // Get nodes in execution order
    const orderedNodes = getTopologicalOrder(workflow);

    // Build edge map for passing data
    const edgeMap = new Map<string, string[]>();
    workflow.edges.forEach((edge) => {
      const sources = edgeMap.get(edge.target) || [];
      sources.push(edge.source);
      edgeMap.set(edge.target, sources);
    });

    // Execute nodes in order
    for (const node of orderedNodes) {
      // Get input data from connected nodes
      const inputNodeIds = edgeMap.get(node.id) || [];
      const inputs = inputNodeIds.map((id) => context[id]);
      const inputData = inputs.length === 1 ? inputs[0] : inputs;

      // Update UI state
      onNodeStateChange?.(node.id, { isExecuting: true, isSuccess: false, isError: false });

      const nodeStartTime = Date.now();
      
      try {
        // Execute the node
        const output = await executeNode(node, inputData);
        
        // Store result in context
        context[node.id] = output;

        const result: ExecutionResult = {
          nodeId: node.id,
          success: true,
          output,
          timestamp: new Date().toISOString(),
          duration: Date.now() - nodeStartTime,
        };

        results.push(result);
        onNodeStateChange?.(node.id, { isExecuting: false, isSuccess: true, output });

      } catch (error) {
        const result: ExecutionResult = {
          nodeId: node.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
          duration: Date.now() - nodeStartTime,
        };

        results.push(result);
        onNodeStateChange?.(node.id, { isExecuting: false, isError: true });

        // Continue execution or stop based on node type
        if (node.type !== 'action') {
          // For non-action nodes, propagate null to dependent nodes
          context[node.id] = null;
        }
      }

      // Small delay for visual feedback
      await sleep(300);
    }

    execution.status = results.every((r) => r.success) ? 'completed' : 'failed';
    
  } catch (error) {
    execution.status = 'failed';
  }

  execution.results = results;
  execution.completedAt = new Date().toISOString();

  return execution;
}

/**
 * Execute a single node
 */
async function executeNode(node: WorkflowNode, inputData: unknown): Promise<unknown> {
  switch (node.type) {
    case 'trigger':
      return executeTriggerNode(node.data as TriggerNodeData, inputData);
    case 'api':
      return executeAPINode(node.data as APINodeData, inputData);
    case 'ai':
      return executeAINode(node.data as AINodeData, inputData);
    case 'logic':
      return executeLogicNode(node.data as LogicNodeData, inputData);
    case 'action':
      return executeActionNode(node.data as ActionNodeData, inputData);
    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
}

/**
 * Execute Trigger Node
 */
async function executeTriggerNode(data: TriggerNodeData, _input: unknown): Promise<unknown> {
  // Trigger nodes just pass through, they start the workflow
  return {
    triggered: true,
    triggerType: data.triggerType,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Execute API Node
 */
async function executeAPINode(data: APINodeData, input: unknown): Promise<unknown> {
  if (!data.url) {
    throw new Error('API URL is required');
  }

  // Replace template variables in URL
  let url = data.url;
  if (input && typeof input === 'object') {
    url = replaceTemplateVars(url, input);
  }

  const options: RequestInit = {
    method: data.method,
    headers: data.headers,
  };

  if ((data.method === 'POST' || data.method === 'PUT') && data.body) {
    let body = data.body;
    if (input && typeof input === 'object') {
      body = replaceTemplateVars(body, input);
    }
    options.body = body;
  }

  try {
    const response = await fetch(url, options);
    
    const contentType = response.headers.get('content-type');
    let responseData: unknown;
    
    if (contentType?.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    return {
      status: response.status,
      data: responseData,
    };
  } catch (error) {
    throw new Error(`API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Execute AI Node
 */
async function executeAINode(data: AINodeData, input: unknown): Promise<unknown> {
  if (!data.userPrompt) {
    throw new Error('User prompt is required');
  }

  // Replace template variables in prompt
  let prompt = data.userPrompt;
  if (input && typeof input === 'object') {
    prompt = replaceTemplateVars(prompt, input);
  }

  // Add system prompt if exists
  const systemPrompt = data.systemPrompt || 'You are a helpful AI assistant.';

  // Use OpenRouter (supports ChatGPT, Claude, etc.)
  if (data.model === 'openrouter') {
    return callOpenRouter(prompt, systemPrompt, data.modelId || 'openai/gpt-3.5-turbo');
  }

  // Use Hugging Face Inference API (free tier)
  if (data.model === 'huggingface') {
    return callHuggingFace(prompt, data.modelId || 'gpt2', data.apiKey);
  }

  // Try OpenRouter first if we have a key, otherwise simulate
  const openRouterKey = process.env.NEXT_PUBLIC_OPENROUTER_KEY;
  if (openRouterKey) {
    return callOpenRouter(prompt, systemPrompt, 'openai/gpt-oss-120b:free');
  }

  // For demo, simulate AI response if no API key
  await sleep(1000);
  return {
    model: data.modelId || 'demo',
    prompt,
    response: `[Demo Mode] AI would process: "${prompt.slice(0, 50)}..."`,
    simulated: true,
  };
}

/**
 * Call OpenRouter API (supports ChatGPT, Claude, Llama, etc.)
 */
async function callOpenRouter(
  prompt: string, 
  systemPrompt: string, 
  modelId: string
): Promise<unknown> {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_KEY;
  
  if (!apiKey) {
    await sleep(800);
    return {
      model: modelId,
      response: `[No API Key] Would call ${modelId} with: "${prompt.slice(0, 50)}..."`,
      simulated: true,
    };
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://forgeflow.app',
        'X-Title': 'ForgeFlow',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${error}`);
    }

    const result = await response.json();
    const aiResponse = result.choices?.[0]?.message?.content || 'No response';
    
    return {
      model: modelId,
      response: aiResponse,
      fullResult: result,
    };
  } catch (error) {
    throw new Error(`AI call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Call Hugging Face Inference API
 */
async function callHuggingFace(prompt: string, modelId: string, apiKey?: string): Promise<unknown> {
  const token = apiKey || process.env.NEXT_PUBLIC_HF_TOKEN;
  
  if (!token) {
    // Return simulated response for demo
    await sleep(800);
    return {
      model: modelId,
      response: `[Demo Mode] AI would process: "${prompt.slice(0, 100)}..."`,
      simulated: true,
    };
  }

  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${modelId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Hugging Face API error: ${error}`);
    }

    const result = await response.json();
    return {
      model: modelId,
      response: result,
    };
  } catch (error) {
    throw new Error(`AI call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Execute Logic Node
 */
async function executeLogicNode(data: LogicNodeData, input: unknown): Promise<unknown> {
  if (!data.condition) {
    throw new Error('Condition is required');
  }

  let conditionMet = false;
  const value = getNestedValue(input, data.condition);

  switch (data.operator) {
    case 'equals':
      conditionMet = value == data.value;
      break;
    case 'contains':
      conditionMet = String(value).includes(data.value);
      break;
    case 'greater':
      conditionMet = Number(value) > Number(data.value);
      break;
    case 'less':
      conditionMet = Number(value) < Number(data.value);
      break;
    case 'exists':
      conditionMet = value !== undefined && value !== null;
      break;
  }

  return {
    condition: data.condition,
    operator: data.operator,
    value: data.value,
    actualValue: value,
    result: conditionMet,
    path: conditionMet ? 'true' : 'false',
    input,
  };
}

/**
 * Execute Action Node
 */
async function executeActionNode(data: ActionNodeData, input: unknown): Promise<unknown> {
  switch (data.actionType) {
    case 'save':
      // Save to localStorage for demo
      const key = data.destination || 'workflow_result';
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(input));
      }
      return { saved: true, key, data: input };

    case 'notify':
      // Browser notification
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Workflow Complete', {
            body: 'Your workflow has finished executing!',
          });
        }
      }
      return { notified: true, input };

    case 'webhook':
      if (!data.webhookUrl) {
        throw new Error('Webhook URL is required');
      }
      const response = await fetch(data.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      return { sent: true, status: response.status };

    case 'blockchain':
      // Placeholder for blockchain integration
      return { 
        blockchain: true, 
        message: 'Would save to Solana blockchain',
        data: input,
      };

    default:
      return { action: data.actionType, input };
  }
}

/**
 * Helper: Replace template variables like {{input.field}}
 */
function replaceTemplateVars(template: string, data: unknown): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    const value = getNestedValue(data, key.trim());
    return value !== undefined ? String(value) : '';
  });
}

/**
 * Helper: Get nested value from object using dot notation
 */
function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object') return undefined;
  
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  
  return current;
}

/**
 * Helper: Sleep for ms milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry wrapper with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(baseDelay * Math.pow(2, i));
    }
  }
  throw new Error('Max retries exceeded');
}
