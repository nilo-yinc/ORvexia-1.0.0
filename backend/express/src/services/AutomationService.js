const Workflow = require('../models/workflow-model');
const WorkflowVersion = require('../models/workflowVersion-model');
const Execution = require('../models/execution-model');
const { runWorkflow } = require('../engine/workflowRunner');
const mongoose = require('mongoose');

class AutomationService {
  static start() {
    console.log('[Automation] Starting Workflow Automation Service...');
    
    // Poll every 60 seconds
    setInterval(async () => {
      try {
        await this.checkAndRunWorkflows();
      } catch (err) {
        console.error('[Automation] Error in polling loop:', err.message);
      }
    }, 60000);

    // Also run once immediately on startup
    this.checkAndRunWorkflows().catch(err => console.error('[Automation] Initial run failed:', err.message));
  }

  static async checkAndRunWorkflows() {
    // Find all active workflows
    const activeWorkflows = await Workflow.find({ is_active: true });
    if (activeWorkflows.length > 0) {
      console.log(`[Automation] Found ${activeWorkflows.length} active workflows to check.`);
    }
    
    for (const workflow of activeWorkflows) {
      if (!workflow.active_version_id) continue;
      
      const version = await WorkflowVersion.findById(workflow.active_version_id);
      if (!version || !version.definition) continue;
      
      const nodes = version.definition.nodes || [];
      const triggerNode = nodes.find(n => n.data?.nodeType === 'Trigger');
      
      if (!triggerNode) continue;
      
      // Check if it's a Gmail trigger
      if (triggerNode.data?.app === 'Gmail' && triggerNode.data?.action === 'new_email') {
        console.log(`[Automation] Match found: Gmail trigger in workflow "${workflow.name}"`);
        await this.processGmailTrigger(workflow, version, triggerNode);
      }
    }
  }

  static async processGmailTrigger(workflow, version, triggerNode) {
    try {
      const execution = await Execution.create({
        workflow_id: workflow._id,
        version_id: version._id,
        status: 'PENDING',
        contextData: { source: 'auto_poll' },
        steps: [],
        startedAt: new Date()
      });

      console.log(`[Automation] Polling Gmail for: ${workflow.name}`);

      try {
        await runWorkflow(
          version.definition.nodes,
          version.definition.edges,
          execution,
          null // io
        );
        
        const updatedExec = await Execution.findById(execution._id);
        const gmailStep = updatedExec.steps.find(s => s.nodeId === triggerNode.id);
        
        if (gmailStep && gmailStep.status === 'SUCCESS' && gmailStep.output?.triggered === false) {
           await Execution.findByIdAndDelete(execution._id);
        } else {
           console.log(`[Automation] Workflow ${workflow.name} executed successfully via trigger.`);
        }
      } catch (err) {
        console.error(`[Automation] Workflow ${workflow.name} failed:`, err.message);
        await Execution.findByIdAndUpdate(execution._id, { 
          status: 'FAILED', 
          completedAt: new Date() 
        });
      }
    } catch (err) {
      console.error('[Automation] Error in processGmailTrigger:', err.message);
    }
  }
}

module.exports = AutomationService;
