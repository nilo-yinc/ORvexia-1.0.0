const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

async function debug() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/orvexia');
  const Workflow = mongoose.model('Workflow', new mongoose.Schema({}, { strict: false }));
  const WorkflowVersion = mongoose.model('WorkflowVersion', new mongoose.Schema({}, { strict: false }));
  const Execution = mongoose.model('Execution', new mongoose.Schema({}, { strict: false }));
  
  // Find ALL workflows named NEW_ARCHITECTURE_MODULE
  const workflows = await Workflow.find({ name: 'NEW_ARCHITECTURE_MODULE' });
  
  console.log('=== ALL NEW_ARCHITECTURE_MODULE WORKFLOWS ===');
  for (const w of workflows) {
    console.log('\n  _id=' + w._id + ' owner_id=' + w.owner_id + ' is_active=' + w.is_active + ' active_version=' + w.active_version_id);
    
    if (w.active_version_id) {
      const v = await WorkflowVersion.findById(w.active_version_id);
      if (v && v.definition) {
        const nodes = v.definition.nodes || [];
        const edges = v.definition.edges || [];
        console.log('  ACTIVE VERSION nodes:');
        for (const n of nodes) {
          const d = n.data || {};
          console.log('    ' + n.id + ': label=' + d.label + ' nodeType=' + d.nodeType + ' category=' + d.category);
          if (d.message) console.log('      message=' + String(d.message).substring(0, 120));
          if (d.channel) console.log('      channel=' + d.channel);
          if (d.prompt) console.log('      prompt=' + String(d.prompt).substring(0, 120));
          if (d.action) console.log('      action=' + d.action);
          if (d.event) console.log('      event=' + d.event);
          if (d.to) console.log('      to=' + d.to);
          if (d.body) console.log('      body=' + String(d.body).substring(0, 120));
        }
        console.log('  edges:');
        for (const e of edges) {
          console.log('    ' + e.source + ' -> ' + e.target);
        }
      }
    }
    
    // Get recent executions
    const execs = await Execution.find({ workflow_id: w._id }).sort({ createdAt: -1 }).limit(3);
    if (execs.length) {
      console.log('  RECENT EXECUTIONS:');
      for (const ex of execs) {
        console.log('    status=' + ex.status + ' created=' + ex.createdAt);
        if (ex.steps) {
          for (const s of ex.steps) {
            console.log('      step ' + s.nodeId + ': ' + s.status);
            if (s.error) console.log('        ERROR: ' + s.error);
            if (s.output) console.log('        output: ' + JSON.stringify(s.output).substring(0, 300));
          }
        }
      }
    }
  }
  
  // Also find ALL executions regardless of workflow in the last day
  const recentAll = await Execution.find({}).sort({ createdAt: -1 }).limit(5);
  console.log('\n=== LAST 5 EXECUTIONS (ALL WORKFLOWS) ===');
  for (const ex of recentAll) {
    console.log('  wf=' + ex.workflow_id + ' status=' + ex.status + ' created=' + ex.createdAt);
    if (ex.steps) {
      for (const s of ex.steps) {
        console.log('    step ' + s.nodeId + ': ' + s.status);
        if (s.error) console.log('      ERROR: ' + s.error);
        if (s.output) console.log('      output: ' + JSON.stringify(s.output).substring(0, 200));
      }
    }
  }
  
  process.exit(0);
}
debug().catch(function(e) { console.error(e); process.exit(1); });
