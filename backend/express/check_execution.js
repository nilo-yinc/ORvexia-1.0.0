const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Execution = mongoose.model('Execution', new mongoose.Schema({}, { strict: false }));
  
  const latest = await Execution.findOne({}).sort({ _id: -1 });
  console.log('=== LATEST EXECUTION ===');
  console.log('Status:', latest.status);
  console.log('Workflow:', latest.workflow_id);
  
  if (latest.steps) {
    for (const step of latest.steps) {
      console.log('\nStep: ' + step.nodeId + ' -> ' + step.status);
      if (step.error) console.log('  ERROR: ' + step.error);
      if (step.output) {
        console.log('  Output: ' + JSON.stringify(step.output, null, 2).substring(0, 500));
      }
    }
  }
  
  if (latest.logs) {
    console.log('\n=== LOGS ===');
    for (const log of latest.logs) {
      console.log('  [' + log.level + '] ' + log.message);
    }
  }
  
  process.exit(0);
}
check().catch(function(e) { console.error(e); process.exit(1); });
