const mongoose = require('mongoose');
const Execution = require('../models/execution-model');
const WorkflowRunner = require('../engine/workflowRunner'); // wait, I can't require workflowRunner directly easily if it's not exporting everything. Let's just mock it.
require('../config/loadEnv');

async function debugFailedNode2() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const exec = await Execution.findById('69f3cb349e9523af258e6bb4');
  if (!exec) return console.log('Execution not found');

  const actionStep = exec.steps.find(s => s.nodeId === 'node_2');
  const input = actionStep?.input || {};
  
  console.log('--- Input ---');
  console.log(JSON.stringify(input, null, 2));

  await mongoose.disconnect();
}

debugFailedNode2().catch(console.error);
