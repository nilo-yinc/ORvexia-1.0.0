const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  const conns = await db.collection('connections').find({}).toArray();
  console.log('=== ALL CONNECTIONS ===');
  for (const c of conns) {
    console.log(JSON.stringify(c, null, 2));
    console.log('---');
  }
  
  // Fix the Slack connection that has teamId but missing appKey/owner_id
  const slackConn = conns.find(c => c.publicData && c.publicData.teamId === 'T0B0FNE6B6V');
  if (slackConn) {
    console.log('\n=== FIXING SLACK CONNECTION ===');
    console.log('Current appKey:', slackConn.appKey);
    console.log('Current owner_id:', slackConn.owner_id);
    
    const userId = new mongoose.Types.ObjectId('6994b9a2d9d1bd53fc0592b4');
    
    await db.collection('connections').updateOne(
      { _id: slackConn._id },
      { 
        $set: { 
          appKey: 'slack',
          owner_id: userId,
          name: slackConn.publicData?.name || 'sportify Slack connection',
          verified: true,
          updatedAt: new Date()
        }
      }
    );
    console.log('FIXED: Set appKey=slack, owner_id=' + userId);
  }
  
  // Also fix any other connections missing appKey
  for (const c of conns) {
    if (!c.appKey && c.publicData) {
      const name = String(c.publicData.name || c.name || '').toLowerCase();
      let appKey = null;
      if (name.includes('slack') || c.publicData.teamId) appKey = 'slack';
      else if (name.includes('gmail') || name.includes('google')) appKey = 'gmail';
      
      if (appKey) {
        await db.collection('connections').updateOne(
          { _id: c._id },
          { $set: { appKey, owner_id: new mongoose.Types.ObjectId('6994b9a2d9d1bd53fc0592b4'), verified: true } }
        );
        console.log('Fixed connection ' + c._id + ' -> appKey=' + appKey);
      }
    }
  }
  
  // Verify
  console.log('\n=== FIXED CONNECTIONS ===');
  const fixed = await db.collection('connections').find({ appKey: 'slack' }).toArray();
  for (const c of fixed) {
    console.log('ID:', c._id, 'appKey:', c.appKey, 'owner_id:', c.owner_id, 'teamId:', c.publicData?.teamId);
  }
  
  // Also check if the Slack bot token is stored
  const Connection = require('./src/models/Connection');
  const CryptoService = require('./src/services/CryptoService');
  const slackFixed = await Connection.findOne({ appKey: 'slack' });
  if (slackFixed && slackFixed.data) {
    const dataKeys = Object.keys(slackFixed.data);
    console.log('\nStored data keys:', dataKeys);
    for (const key of dataKeys) {
      try {
        const val = CryptoService.decrypt(slackFixed.data[key]);
        console.log('  ' + key + ': ' + String(val).substring(0, 20) + '...');
      } catch(e) {
        console.log('  ' + key + ': [decrypt failed] raw=' + String(slackFixed.data[key]).substring(0, 30));
      }
    }
  }
  
  process.exit(0);
}
fix().catch(e => { console.error(e); process.exit(1); });
