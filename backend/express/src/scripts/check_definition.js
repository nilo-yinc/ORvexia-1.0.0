const mongoose = require('mongoose');
const Workflow = require('../models/workflow-model');
const WorkflowVersion = require('../models/workflowVersion-model');
require('../config/loadEnv');

async function checkDefinition() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  
  const workflowId = '69f395faa7cab035342ba694';
  const workflow = await Workflow.findById(workflowId);
  const version = await WorkflowVersion.findById(workflow.active_version_id);
  
  console.log(`Workflow: ${workflow.name}`);
  console.log(`Definition Nodes:`);
  version.definition.nodes.forEach(n => {
    console.log(`- Node: ${n.id}, Type: ${n.data?.nodeType}, App: ${n.data?.app}, Action: ${n.data?.action}, Label: ${n.data?.label}`);
  });
  
  await mongoose.disconnect();
}

checkDefinition().catch(console.error);
