const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

async function debug() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/orvexia');
  const Connection = mongoose.model('Connection', new mongoose.Schema({}, { strict: false }));
  
  const all = await Connection.find({});
  console.log('=== ALL CONNECTIONS ===');
  for (const c of all) {
    console.log('  appKey=' + c.appKey + ', owner_id=' + c.owner_id + ', name=' + c.name);
    console.log('    publicData=' + JSON.stringify(c.publicData));
    const dataKeys = Object.keys(c.data || {});
    console.log('    data keys=' + dataKeys.join(', '));
    if (c.data && c.data.token) {
      const tokenVal = typeof c.data.token === 'string' ? c.data.token.substring(0, 50) : JSON.stringify(c.data.token).substring(0, 80);
      console.log('    token preview: ' + tokenVal + '...');
    }
  }
  
  console.log('\n=== ENV KEYS ===');
  console.log('GEMINI_API_KEY: ' + (process.env.GEMINI_API_KEY ? 'SET' : 'MISSING'));
  console.log('NGROK_AUTHTOKEN: ' + (process.env.NGROK_AUTHTOKEN ? 'SET' : 'MISSING'));
  console.log('SLACK_CLIENT_ID: ' + (process.env.SLACK_CLIENT_ID ? 'SET' : 'MISSING'));
  console.log('SLACK_CLIENT_SECRET: ' + (process.env.SLACK_CLIENT_SECRET ? 'SET' : 'MISSING'));
  console.log('SLACK_BOT_TOKEN: ' + (process.env.SLACK_BOT_TOKEN ? 'SET' : 'MISSING'));
  
  const Workflow = mongoose.model('Workflow', new mongoose.Schema({}, { strict: false }));
  const workflows = await Workflow.find({ is_active: true });
  console.log('\n=== ACTIVE WORKFLOWS ===');
  for (const w of workflows) {
    console.log('  name=' + w.name + ', owner_id=' + w.owner_id + ', active_version_id=' + w.active_version_id);
  }
  
  const WorkflowVersion = mongoose.model('WorkflowVersion', new mongoose.Schema({}, { strict: false }));
  for (const w of workflows) {
    if (w.active_version_id) {
      const v = await WorkflowVersion.findById(w.active_version_id);
      if (v && v.definition) {
        const nodes = v.definition.nodes || [];
        console.log('\n  Workflow "' + w.name + '" nodes:');
        for (const n of nodes) {
          console.log('    id=' + n.id + ' label=' + (n.data && n.data.label) + ' nodeType=' + (n.data && n.data.nodeType) + ' category=' + (n.data && n.data.category));
        }
      }
    }
  }
  
  const Execution = mongoose.model('Execution', new mongoose.Schema({}, { strict: false }));
  const recent = await Execution.find({}).sort({ createdAt: -1 }).limit(5);
  console.log('\n=== RECENT EXECUTIONS ===');
  for (const e of recent) {
    console.log('  id=' + e._id + ', status=' + e.status + ', workflow_id=' + e.workflow_id);
    if (e.logs && e.logs.length) {
      const lastLogs = e.logs.slice(-4);
      for (const log of lastLogs) {
        console.log('    [' + log.level + '] ' + log.message);
      }
    }
    if (e.steps && e.steps.length) {
      for (const step of e.steps) {
        console.log('    step: ' + step.nodeId + ' status=' + step.status);
        if (step.error) console.log('      ERROR: ' + step.error);
        if (step.output) console.log('      output keys: ' + Object.keys(step.output).join(', '));
      }
    }
  }
  
  process.exit(0);
}
debug().catch(function(e) { console.error(e); process.exit(1); });
