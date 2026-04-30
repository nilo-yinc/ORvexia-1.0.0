const mongoose = require('mongoose');
const Execution = require('../models/execution-model');
require('../config/loadEnv');

async function checkExecutions() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  
  const workflowId = '69f395faa7cab035342ba694';
  const recent = await Execution.find({
    workflow_id: new mongoose.Types.ObjectId(workflowId),
    startedAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) }
  }).sort({ startedAt: -1 });
  
  console.log(`Recent executions for GMAIL WORKFLOW (${workflowId}):`);
  if (recent.length === 0) console.log('None found.');
  recent.forEach(exec => {
    console.log(`- ID: ${exec._id}, Status: ${exec.status}, Started: ${exec.startedAt}`);
    exec.logs.forEach(l => console.log(`  [${l.level}] ${l.message}`));
  });
  
  await mongoose.disconnect();
}

checkExecutions().catch(console.error);
