use anchor_lang::prelude::*;

declare_id!("ForgeFLowXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

#[program]
pub mod forgeflow {
    use super::*;

    /// Create a new workflow on-chain
    pub fn create_workflow(
        ctx: Context<CreateWorkflow>,
        workflow_id: String,
        name: String,
        workflow_json: String,
    ) -> Result<()> {
        let workflow = &mut ctx.accounts.workflow;
        let owner = &ctx.accounts.owner;
        let clock = Clock::get()?;

        workflow.owner = owner.key();
        workflow.workflow_id = workflow_id;
        workflow.name = name;
        workflow.workflow_json = workflow_json;
        workflow.created_at = clock.unix_timestamp;
        workflow.updated_at = clock.unix_timestamp;
        workflow.execution_count = 0;
        workflow.is_active = true;

        msg!("Workflow created: {}", workflow.name);
        Ok(())
    }

    /// Update an existing workflow
    pub fn update_workflow(
        ctx: Context<UpdateWorkflow>,
        name: String,
        workflow_json: String,
    ) -> Result<()> {
        let workflow = &mut ctx.accounts.workflow;
        let clock = Clock::get()?;

        workflow.name = name;
        workflow.workflow_json = workflow_json;
        workflow.updated_at = clock.unix_timestamp;

        msg!("Workflow updated: {}", workflow.name);
        Ok(())
    }

    /// Execute a workflow and store the result
    pub fn execute_workflow(
        ctx: Context<ExecuteWorkflow>,
        execution_id: String,
        result_json: String,
        success: bool,
    ) -> Result<()> {
        let workflow = &mut ctx.accounts.workflow;
        let execution = &mut ctx.accounts.execution;
        let executor = &ctx.accounts.executor;
        let clock = Clock::get()?;

        // Update workflow execution count
        workflow.execution_count += 1;

        // Store execution result
        execution.workflow = workflow.key();
        execution.executor = executor.key();
        execution.execution_id = execution_id;
        execution.result_json = result_json;
        execution.success = success;
        execution.executed_at = clock.unix_timestamp;

        msg!("Workflow executed. Success: {}", success);
        Ok(())
    }

    /// Delete a workflow
    pub fn delete_workflow(_ctx: Context<DeleteWorkflow>) -> Result<()> {
        msg!("Workflow deleted");
        Ok(())
    }

    /// Toggle workflow active status
    pub fn toggle_workflow(ctx: Context<UpdateWorkflow>) -> Result<()> {
        let workflow = &mut ctx.accounts.workflow;
        workflow.is_active = !workflow.is_active;
        
        msg!("Workflow active status: {}", workflow.is_active);
        Ok(())
    }
}

// ============ ACCOUNTS ============

#[derive(Accounts)]
#[instruction(workflow_id: String)]
pub struct CreateWorkflow<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + Workflow::INIT_SPACE,
        seeds = [b"workflow", owner.key().as_ref(), workflow_id.as_bytes()],
        bump
    )]
    pub workflow: Account<'info, Workflow>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateWorkflow<'info> {
    #[account(
        mut,
        has_one = owner,
    )]
    pub workflow: Account<'info, Workflow>,
    
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(execution_id: String)]
pub struct ExecuteWorkflow<'info> {
    #[account(mut)]
    pub workflow: Account<'info, Workflow>,
    
    #[account(
        init,
        payer = executor,
        space = 8 + Execution::INIT_SPACE,
        seeds = [b"execution", workflow.key().as_ref(), execution_id.as_bytes()],
        bump
    )]
    pub execution: Account<'info, Execution>,
    
    #[account(mut)]
    pub executor: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DeleteWorkflow<'info> {
    #[account(
        mut,
        has_one = owner,
        close = owner
    )]
    pub workflow: Account<'info, Workflow>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
}

// ============ STATE ============

#[account]
#[derive(InitSpace)]
pub struct Workflow {
    pub owner: Pubkey,
    
    #[max_len(64)]
    pub workflow_id: String,
    
    #[max_len(128)]
    pub name: String,
    
    #[max_len(10000)]
    pub workflow_json: String,
    
    pub created_at: i64,
    pub updated_at: i64,
    pub execution_count: u64,
    pub is_active: bool,
}

#[account]
#[derive(InitSpace)]
pub struct Execution {
    pub workflow: Pubkey,
    pub executor: Pubkey,
    
    #[max_len(64)]
    pub execution_id: String,
    
    #[max_len(5000)]
    pub result_json: String,
    
    pub success: bool,
    pub executed_at: i64,
}

// ============ ERRORS ============

#[error_code]
pub enum ForgeFlowError {
    #[msg("Workflow name too long")]
    NameTooLong,
    
    #[msg("Workflow JSON too large")]
    WorkflowTooLarge,
    
    #[msg("Unauthorized access")]
    Unauthorized,
    
    #[msg("Workflow is not active")]
    WorkflowInactive,
}
