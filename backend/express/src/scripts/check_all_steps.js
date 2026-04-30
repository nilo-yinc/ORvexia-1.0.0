const mongoose = require('mongoose');
const Execution = require('../models/execution-model');
require('../config/loadEnv');

async function checkFailedData() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const exec = await Execution.findOne({ status: 'FAILED' }).sort({ startedAt: -1 });
  if (!exec) return console.log('No failed execution found');

  exec.steps.forEach(s => {
    console.log(`Node: ${s.nodeId}, Status: ${s.status}, Error: ${String(s.output?.error).substring(0, 100)}`);
  });
  
  await mongoose.disconnect();
}

checkFailedData().catch(console.error);
