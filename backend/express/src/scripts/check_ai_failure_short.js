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
  console.log('Error Reason:', String(actionStep.output?.error).substring(0, 500));
  
  const aiConfig = actionStep.input?.config || {};
  console.log('Prompt start:', String(aiConfig.prompt || aiConfig.text || aiConfig.message).substring(0, 200));

  await mongoose.disconnect();
}

checkFailedData().catch(console.error);
