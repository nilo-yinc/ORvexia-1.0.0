const mongoose = require('mongoose');
const Execution = require('../models/execution-model');
const Workflow = require('../models/workflow-model');
const User = require('../models/user.models');
require('../config/loadEnv');

async function checkExecutions() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  
  const recent = await Execution.find({
    startedAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) }
  }).sort({ startedAt: -1 }).limit(1);
  
  if (recent.length > 0) {
    const exec = recent[0];
    const workflow = await Workflow.findById(exec.workflow_id);
    const user = await User.findById(workflow.owner_id);
    console.log(`Workflow Owner: ${user?.email} (${user?._id})`);
  }
  
  await mongoose.disconnect();
}

checkExecutions().catch(console.error);
