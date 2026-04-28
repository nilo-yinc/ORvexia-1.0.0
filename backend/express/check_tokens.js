require('./src/config/loadEnv');
const mongoose = require('mongoose');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Connection = require('./src/models/Connection');
  const CryptoService = require('./src/services/CryptoService');
  const axios = require('axios');

  const conns = await Connection.find({ appKey: 'slack' }).sort({ updatedAt: -1 });
  console.log('Total slack connections:', conns.length);
  
  for (const c of conns) {
    let token = 'NO_TOKEN';
    if (c.data && c.data.token) {
      token = CryptoService.decrypt(c.data.token);
    }
    
    let authTeam = 'unknown';
    try {
      const r = await axios.get('https://slack.com/api/auth.test', {
        headers: { Authorization: 'Bearer ' + token }
      });
      authTeam = r.data.team_id + ' (' + r.data.team + ')';
    } catch(e) {}
    
    console.log('---');
    console.log('ID:', String(c._id));
    console.log('  publicData.teamId:', c.publicData?.teamId);
    console.log('  owner_id:', String(c.owner_id));
    console.log('  token prefix:', token.substring(0, 25) + '...');
    console.log('  auth team:', authTeam);
    console.log('  updated:', c.updatedAt);
    
    // Test channels:history
    const histRes = await axios.get('https://slack.com/api/conversations.history', {
      headers: { Authorization: 'Bearer ' + token },
      params: { channel: 'C0B00PFEN3G', limit: 2 }
    });
    console.log('  channels:history:', histRes.data.ok ? 'YES!' : 'NO - ' + histRes.data.error);
    
    if (histRes.data.ok && histRes.data.messages) {
      for (const m of histRes.data.messages) {
        console.log('    msg:', (m.bot_id ? 'BOT' : m.user) + ': ' + (m.text || '').substring(0, 60));
      }
    }
  }
  
  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
