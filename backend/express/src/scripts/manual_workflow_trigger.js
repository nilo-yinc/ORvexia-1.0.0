const mongoose = require('mongoose');
const Execution = require('../models/execution-model');
const Workflow = require('../models/workflow-model');
const WorkflowVersion = require('../models/workflowVersion-model');
const { runWorkflow } = require('../engine/workflowRunner');
require('../config/loadEnv');

async function testRunWorkflow() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  // get the workflow definition
  const exec = await Execution.findById('69f3cb349e9523af258e6bb4');
  if (!exec) return console.log('Execution not found');

  const workflow = await Workflow.findById(exec.workflow_id);
  const version = await WorkflowVersion.findById(workflow.active_version_id);

  // create a dummy execution document
  const dummyExecution = new Execution({
    workflow_id: workflow._id,
    workflowOwnerId: workflow.owner_id,
    status: 'PENDING',
    contextData: exec.contextData || { source: 'auto_poll' }
  });
  await dummyExecution.save();

  console.log('Running workflow manually...');
  try {
    await runWorkflow(version.definition.nodes, version.definition.edges, dummyExecution, null);
    console.log('Workflow finished successfully!');
  } catch (error) {
    console.error('Workflow failed:', error.message);
  }

  await mongoose.disconnect();
}

testRunWorkflow().catch(console.error);
