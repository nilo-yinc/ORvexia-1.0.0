const mongoose = require('mongoose');
const Execution = require('../models/execution-model');
require('../config/loadEnv');

async function checkFailedData() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const exec = await Execution.findOne({ status: 'FAILED' }).sort({ startedAt: -1 });
  if (!exec) return console.log('No failed execution found');

  const actionStep = exec.steps.find(s => s.status === 'FAILED' || s.status === 'RUNNING');
  if (!actionStep) return console.log('No failed step found');
  
  const input = actionStep.input || {};
  console.log('Action Node ID:', actionStep.nodeId);
  console.log('Input keys:', Object.keys(input));
  console.log('trigger Object keys:', input.trigger ? Object.keys(input.trigger) : 'None');
  console.log('trigger.Email_ID:', input.trigger?.Email_ID);
  console.log('trigger.Thread_ID:', input.trigger?.Thread_ID);
  console.log('trigger.Message_ID:', input.trigger?.Message_ID);
  console.log('trigger.Sender:', input.trigger?.Sender);
  
  // also check node_1, node_2 outputs
  console.log('node_1 Output:', input.steps?.node_1 ? Object.keys(input.steps.node_1) : 'None');
  console.log('node_2 Output:', input.steps?.node_2 ? Object.keys(input.steps.node_2) : 'None');
  
  await mongoose.disconnect();
}

checkFailedData().catch(console.error);
