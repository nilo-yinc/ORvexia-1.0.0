const mongoose = require('mongoose');
const GoogleService = require('../services/GoogleService');
const User = require('../models/user.models');
const Workflow = require('../models/workflow-model');
const Execution = require('../models/execution-model');
require('../config/loadEnv');

function base64Url(str) {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function testGmailSend() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const exec = await Execution.findOne({ status: 'FAILED' }).sort({ startedAt: -1 });
  if (!exec) return console.log('No failed execution found');
  
  const workflow = await Workflow.findById(exec.workflow_id);
  const ownerId = workflow.owner_id;

  const trigger = exec.steps.find(s => s.status === 'SUCCESS' && s.output?.Email_ID)?.output || {};

  const to = trigger.Sender || trigger.from || 'niloymallik00001@gmail.com';
  const subject = `Re: ${trigger.Subject || "Test"}`;
  const body = 'This is a test reply to see why it failed 400.';
  const threadId = trigger.Thread_ID;
  const inReplyTo = trigger.Message_ID;

  const headers = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=UTF-8",
  ];
  if (inReplyTo) {
    headers.push(`In-Reply-To: ${inReplyTo}`);
    headers.push(`References: ${inReplyTo}`);
  }
  const raw = base64Url(`${headers.join("\r\n")}\r\n\r\n${body}`);

  console.log('Sending to Gmail API with raw payload length:', raw.length);
  console.log('threadId:', threadId, 'inReplyTo:', inReplyTo);

  try {
    const response = await GoogleService.request(ownerId, {
      method: "POST",
      url: "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      data: { raw, threadId },
    });
    console.log('Success!', response.data);
  } catch (error) {
    console.error('Error from Google:', JSON.stringify(error.response?.data || error.message, null, 2));
  }
  
  await mongoose.disconnect();
}

testGmailSend().catch(console.error);
