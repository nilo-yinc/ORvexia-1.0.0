require('../src/config/loadEnv');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const ConnectionService = require('../src/services/ConnectionService');
  const conn = await ConnectionService.get('6994e4f7d9d1bd53fc059360', 'slack');
  const axios = require('axios');
  const res = await axios.get('https://slack.com/api/conversations.history?channel=C0B00PFEN3G&limit=3', {
    headers: { Authorization: 'Bearer ' + conn.secrets.token }
  });
  console.log('Messages:');
  for (const m of res.data.messages) {
    console.log(`User/Bot: ${m.user || m.bot_id}`);
    console.log(`Text: ${m.text}`);
    console.log('---');
  }
  mongoose.disconnect();
}).catch(console.error);
