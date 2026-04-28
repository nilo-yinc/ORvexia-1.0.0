const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

async function cleanup() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Workflow = mongoose.model('Workflow', new mongoose.Schema({}, { strict: false }));
  const WorkflowVersion = mongoose.model('WorkflowVersion', new mongoose.Schema({}, { strict: false }));

  const userId = '6994b9a2d9d1bd53fc0592b4';
  
  // Deactivate ALL workflows except our two new ones
  const keepNames = ['Slack AI Auto-Responder', 'Gmail to Slack Notifier'];
  
  await Workflow.updateMany(
    { _id: { $nin: [] } },
    { $set: { is_active: false } }
  );
  console.log('Deactivated all workflows');

  // Now activate only the two we want
  const slack = await Workflow.findOne({ name: 'Slack AI Auto-Responder', owner_id: userId });
  const gmail = await Workflow.findOne({ name: 'Gmail to Slack Notifier', owner_id: userId });
  
  if (slack) {
    // Make sure version is linked
    const sv = await WorkflowVersion.findOne({ workflow_id: slack._id }).sort({ _id: -1 });
    if (sv) {
      await Workflow.updateOne({ _id: slack._id }, { $set: { is_active: true, active_version_id: sv._id } });
      console.log('Activated Slack AI Auto-Responder with version ' + sv._id);
    }
  }
  
  if (gmail) {
    const gv = await WorkflowVersion.findOne({ workflow_id: gmail._id }).sort({ _id: -1 });
    if (gv) {
      await Workflow.updateOne({ _id: gmail._id }, { $set: { is_active: true, active_version_id: gv._id } });
      console.log('Activated Gmail to Slack Notifier with version ' + gv._id);
    }
  }

  // Verify
  const active = await Workflow.find({ is_active: true });
  console.log('\n=== FINAL ACTIVE WORKFLOWS ===');
  for (const w of active) {
    console.log('  ' + w.name + ' owner=' + w.owner_id + ' version=' + w.active_version_id);
    if (w.active_version_id) {
      const v = await WorkflowVersion.findById(w.active_version_id);
      if (v) {
        const nodes = v.definition.nodes || [];
        const edges = v.definition.edges || [];
        console.log('    nodes: ' + nodes.map(function(n) { return n.id + '(' + (n.data && n.data.label) + ')'; }).join(' -> '));
        console.log('    edges: ' + edges.map(function(e) { return e.source + '->' + e.target; }).join(', '));
      }
    }
  }

  process.exit(0);
}
cleanup().catch(function(e) { console.error(e); process.exit(1); });
