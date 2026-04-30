const mongoose = require('mongoose');
const User = require('../models/user.models');
const Workflow = require('../models/workflow-model');
const Execution = require('../models/execution-model');
require('../config/loadEnv');

async function checkUser() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const exec = await Execution.findOne({ status: 'FAILED' }).sort({ startedAt: -1 });
  if (!exec) return console.log('No failed execution found');

  const workflow = await Workflow.findById(exec.workflow_id);
  const user = await User.findById(workflow.owner_id);
  console.log('User Email:', user.email);
  console.log('Has Access Token:', !!user.googleAccessToken);
  console.log('Has Refresh Token:', !!user.googleRefreshToken);
  
  await mongoose.disconnect();
}

checkUser().catch(console.error);
