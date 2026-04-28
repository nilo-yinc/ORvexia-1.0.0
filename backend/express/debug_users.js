const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

async function debug() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/orvexia');
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  
  const users = await User.find({});
  console.log('=== ALL USERS ===');
  for (const u of users) {
    console.log('  id=' + u._id + ' email=' + u.email + ' name=' + u.name);
    console.log('    googleAccessToken: ' + (u.googleAccessToken ? 'SET (' + u.googleAccessToken.substring(0, 20) + '...)' : 'MISSING'));
    console.log('    googleRefreshToken: ' + (u.googleRefreshToken ? 'SET' : 'MISSING'));
  }
  
  // Also check if the Slack connection owner (6994b9a2d9d1bd53fc0592b4) matches any user
  console.log('\n=== SLACK CONNECTION OWNER CHECK ===');
  const slackOwner = await User.findById('6994b9a2d9d1bd53fc0592b4');
  if (slackOwner) {
    console.log('Slack connection owner: ' + slackOwner.email + ' (' + slackOwner.name + ')');
    console.log('  Has Google tokens: ' + (slackOwner.googleAccessToken ? 'YES' : 'NO'));
  } else {
    console.log('Slack connection owner 6994b9a2d9d1bd53fc0592b4 NOT FOUND in users');
  }
  
  process.exit(0);
}
debug().catch(function(e) { console.error(e); process.exit(1); });
