import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useWorkflowStore } from '@/stores/workflowStore';
import { 
  serializeWorkflow, 
  validateWorkflow, 
  exportWorkflow, 
  importWorkflow 
} from '@/utils/workflowSerializer';
import { executeWorkflow } from '@/utils/nodeExecutor';
import { Workflow, WorkflowExecution } from '@/types/workflow';
import { v4 as uuidv4 } from 'uuid';

export function useWorkflow() {
  const [lastExecution, setLastExecution] = useState<WorkflowExecution | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const {
    nodes,
    edges,
    workflowName,
    workflowId,
    setExecuting,
    updateNodeExecutionState,
    loadWorkflow,
    savedWorkflows,
  } = useWorkflowStore();

  /**
   * Validate the current workflow
   */
  const validate = useCallback(() => {
    const workflow = serializeWorkflow(nodes, edges, workflowName, workflowId || undefined);
    const result = validateWorkflow(workflow);
    setValidationErrors(result.errors);
    return result;
  }, [nodes, edges, workflowName, workflowId]);

  /**
   * Store execution result to localStorage
   */
  const storeExecutionResult = useCallback((execution: WorkflowExecution) => {
    try {
      const executions = JSON.parse(
        localStorage.getItem('solana_executions') || '[]'
      );
      
      executions.push({
        executionId: execution.executionId || uuidv4(),
        workflowId: execution.workflowId,
        resultJson: JSON.stringify(execution.results),
        success: execution.status === 'completed',
        executedAt: Date.now(),
      });

      localStorage.setItem('solana_executions', JSON.stringify(executions));
    } catch (err) {
      console.error('Failed to store execution:', err);
    }
  }, []);

  /**
   * Run the current workflow
   */
  const run = useCallback(async () => {
    // Validate first
    const validation = validate();
    if (!validation.valid) {
      toast.error(`Validation failed:\n${validation.errors[0]}`);
      return null;
    }

    // Serialize workflow
    const workflow = serializeWorkflow(nodes, edges, workflowName, workflowId || undefined);

    // Set executing state
    setExecuting(true);
    const loadingToast = toast.loading('Running workflow...');

    try {
      // Execute workflow
      const execution = await executeWorkflow(workflow, (nodeId, state) => {
        updateNodeExecutionState(nodeId, state);
      });

      setLastExecution(execution);
      toast.dismiss(loadingToast);
      
      // Store execution result
      storeExecutionResult(execution);
      
      if (execution.status === 'completed') {
        toast.success('Workflow completed successfully!');
      } else {
        const firstError = execution.results.find(r => !r.success)?.error;
        toast.error(`Workflow failed: ${firstError || 'Check node results'}`);
      }

      return execution;
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Execution error occurred');
      console.error('Workflow execution error:', error);
      return null;
    } finally {
      setExecuting(false);
      
      // Reset node states after a delay
      setTimeout(() => {
        nodes.forEach((node) => {
          updateNodeExecutionState(node.id, { 
            isExecuting: false, 
            isSuccess: false, 
            isError: false 
          });
        });
      }, 3000);
    }
  }, [nodes, edges, workflowName, workflowId, validate, setExecuting, updateNodeExecutionState, storeExecutionResult]);

  /**
   * Export workflow as JSON
   */
  const exportAsJson = useCallback(() => {
    if (nodes.length === 0) {
      toast.error('No workflow to export');
      return;
    }

    const workflow = serializeWorkflow(nodes, edges, workflowName, workflowId || undefined);
    const json = exportWorkflow(workflow);
    
    // Create download
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Workflow exported!');
  }, [nodes, edges, workflowName, workflowId]);

  /**
   * Import workflow from JSON
   */
  const importFromJson = useCallback((jsonString: string) => {
    const workflow = importWorkflow(jsonString);
    if (workflow) {
      loadWorkflow(workflow);
      toast.success(`Loaded "${workflow.name}"`);
      return true;
    }
    toast.error('Invalid workflow file');
    return false;
  }, [loadWorkflow]);

  /**
   * Import workflow from file
   */
  const importFromFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const json = event.target?.result as string;
          importFromJson(json);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [importFromJson]);

  /**
   * Load a demo workflow
   */
  const loadDemo = useCallback((workflow: Workflow) => {
    loadWorkflow(workflow);
    toast.success(`Loaded demo: "${workflow.name}"`);
  }, [loadWorkflow]);

  return {
    validate,
    run,
    exportAsJson,
    importFromJson,
    importFromFile,
    loadDemo,
    lastExecution,
    validationErrors,
    savedWorkflows,
  };
}
