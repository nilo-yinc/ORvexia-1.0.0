const mongoose = require('mongoose');
const Execution = require('../models/execution-model');
require('../config/loadEnv');

async function checkAIOutput() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const exec = await Execution.findOne({ status: 'FAILED' }).sort({ startedAt: -1 });
  if (!exec) return console.log('No failed execution found');

  const aiStep = exec.steps.find(s => s.nodeId === 'node_2');
  if (!aiStep) return console.log('No node_2 found');

  console.log('AI Node Status:', aiStep.status);
  console.log('AI Node Output:', JSON.stringify(aiStep.output, null, 2));
  
  await mongoose.disconnect();
}

checkAIOutput().catch(console.error);
