const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const oid = new mongoose.Types.ObjectId('6994b9a2d9d1bd53fc0592b4');
  
  // Fix owner_id from string to ObjectId in workflows
  const r1 = await db.collection('workflows').updateMany(
    { owner_id: '6994b9a2d9d1bd53fc0592b4' },
    { $set: { owner_id: oid } }
  );
  console.log('Fixed workflows: ' + r1.modifiedCount);
  
  // Verify
  const Workflow = require('./src/models/workflow-model');
  const active = await Workflow.find({ owner_id: oid, is_active: true });
  console.log('Active workflows via Mongoose: ' + active.length);
  for (const w of active) {
    console.log('  ' + w.name + ' version=' + w.active_version_id);
  }
  
  process.exit(0);
}
fix().catch(function(e) { console.error(e); process.exit(1); });
