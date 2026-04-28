require('../src/config/loadEnv');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Execution = require('../src/models/execution-model');
  const Workflow = require('../src/models/workflow-model');
  const WorkflowVersion = require('../src/models/workflowVersion-model');

  console.log('Cleaning up sample data...');

  const exRes = await Execution.deleteMany({});
  console.log(`Deleted ${exRes.deletedCount} executions.`);

  // Keep only active workflows for the current user
  const currentUser = '6994e4f7d9d1bd53fc059360';
  const wfRes = await Workflow.deleteMany({ 
    $or: [
      { owner_id: { $ne: currentUser } },
      { is_active: false }
    ]
  });
  console.log(`Deleted ${wfRes.deletedCount} workflows.`);

  // Delete versions that don't belong to any remaining workflow
  const remainingWfs = await Workflow.find({});
  const remainingIds = remainingWfs.map(w => w._id);
  const vRes = await WorkflowVersion.deleteMany({ workflow_id: { $nin: remainingIds } });
  console.log(`Deleted ${vRes.deletedCount} workflow versions.`);

  console.log('Cleanup complete.');
  mongoose.disconnect();
}).catch(console.error);
