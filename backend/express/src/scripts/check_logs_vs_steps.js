const mongoose = require('mongoose');
const Execution = require('../models/execution-model');
require('../config/loadEnv');

async function checkFailedData() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const exec = await Execution.findOne({ status: 'FAILED' }).sort({ startedAt: -1 });
  if (!exec) return console.log('No failed execution found');

  console.log('Execution ID:', exec._id);
  exec.logs.forEach(l => console.log(`[${l.level}] ${l.message} (Node: ${l.nodeId})`));
  console.log('--- Steps ---');
  exec.steps.forEach(s => {
    console.log(`Node: ${s.nodeId}, Status: ${s.status}, Label: ${s.label}, Error: ${s.error}`);
  });
  
  await mongoose.disconnect();
}

checkFailedData().catch(console.error);
