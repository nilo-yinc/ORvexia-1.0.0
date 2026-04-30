const mongoose = require('mongoose');
const Execution = require('./backend/express/src/models/execution-model');
require('./backend/express/src/config/loadEnv');

async function checkExecutions() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  
  const recent = await Execution.find({
    startedAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
  }).sort({ startedAt: -1 }).limit(10);
  
  console.log('Recent executions (last 1h):');
  recent.forEach(exec => {
    console.log(`- Workflow: ${exec.workflow_id}, Status: ${exec.status}, Trigger: ${JSON.stringify(exec.trigger)}, Started: ${exec.startedAt}`);
  });
  
  await mongoose.disconnect();
}

checkExecutions().catch(console.error);
