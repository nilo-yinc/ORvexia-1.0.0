const mongoose = require('mongoose');
const Workflow = require('../models/workflow-model');
const User = require('../models/user.models');
require('../config/loadEnv');

async function checkActiveWorkflows() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  
  const active = await Workflow.find({ is_active: true });
  console.log(`Found ${active.length} active workflows:`);
  
  for (const wf of active) {
    const user = await User.findById(wf.owner_id);
    console.log(`- Workflow: "${wf.name}" (${wf._id}), Owner: ${user?.email}`);
  }
  
  await mongoose.disconnect();
}

checkActiveWorkflows().catch(console.error);
