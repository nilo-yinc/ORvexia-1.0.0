require('../src/config/loadEnv');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Execution = require('../src/models/execution-model');
  const Workflow = require('../src/models/workflow-model');
  
  console.log('--- EXECUTIONS ---');
  const executions = await Execution.find({}).sort({ startedAt: -1 }).limit(20);
  executions.forEach(e => {
    console.log(`ID: ${e._id}, Status: ${e.status}, Workflow: ${e.workflow_id}`);
  });

  console.log('\n--- WORKFLOWS ---');
  const workflows = await Workflow.find({});
  workflows.forEach(w => {
    console.log(`ID: ${w._id}, Name: ${w.name}, Owner: ${w.owner_id}, Active: ${w.is_active}`);
  });

  mongoose.disconnect();
}).catch(console.error);
