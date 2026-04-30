const mongoose = require('mongoose');
const Execution = require('../models/execution-model');
require('../config/loadEnv');

async function checkFailedData() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const exec = await Execution.findById('69f3cb349e9523af258e6bb4');
  if (!exec) return console.log('Execution not found');

  const actionStep = exec.steps.find(s => s.nodeId === 'node_2');
  console.log('Node 2 Input:', JSON.stringify(actionStep?.input || {}, null, 2));
  
  await mongoose.disconnect();
}

checkFailedData().catch(console.error);
