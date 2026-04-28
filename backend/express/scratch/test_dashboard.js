require('../src/config/loadEnv');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Workflow = require('../src/models/workflow-model');
  const Execution = require('../src/models/execution-model');
  try {
    const user = { id: '6994e4f7d9d1bd53fc059360' };
    const workflows = await Workflow.find({ owner_id: user.id });
    const workflowIds = workflows.map(w => w._id);
    console.log('User ID:', user.id);
    console.log('Workflow IDs:', workflowIds);
    
    const executions = await Execution.find({ workflow_id: { $in: workflowIds } })
        .sort({ startedAt: -1 })
        .limit(5)
        .populate('workflow_id', 'name');
    console.log('Executions count:', executions.length);
    if (executions.length > 0) {
      console.log('First execution:', executions[0].workflow_id?.name || 'No Name');
    }
  } catch (err) {
    console.log('ERROR:', err.message);
  }
  mongoose.disconnect();
}).catch(console.error);
