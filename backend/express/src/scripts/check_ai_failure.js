const mongoose = require('mongoose');
const Execution = require('../models/execution-model');
require('../config/loadEnv');

async function checkFailedData() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const exec = await Execution.findOne({ status: 'FAILED' }).sort({ startedAt: -1 });
  if (!exec) return console.log('No failed execution found');

  const actionStep = exec.steps.find(s => s.status === 'FAILED');
  if (!actionStep) return console.log('No failed step found');
  
  console.log('Failed Node ID:', actionStep.nodeId);
  console.log('Error Reason:', actionStep.output?.error);
  
  // also get the prompt evaluated config
  const aiConfig = actionStep.input?.config || {};
  console.log('Evaluated Config for AI Node:', JSON.stringify(aiConfig, null, 2));

  // Check the trigger step output
  const triggerStep = exec.steps.find(s => s.status === 'SUCCESS');
  if (triggerStep) {
      console.log('Trigger Node ID:', triggerStep.nodeId);
      console.log('Trigger Output keys:', Object.keys(triggerStep.output || {}));
      console.log('Trigger Result:', triggerStep.output?.Result);
  }
  
  await mongoose.disconnect();
}

checkFailedData().catch(console.error);
