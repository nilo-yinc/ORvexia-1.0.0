const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

async function fixWorkflows() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/orvexia');
  const Workflow = mongoose.model('Workflow', new mongoose.Schema({}, { strict: false }));
  const WorkflowVersion = mongoose.model('WorkflowVersion', new mongoose.Schema({}, { strict: false }));

  const userId = '6994b9a2d9d1bd53fc0592b4'; // niloymallik0001@gmail.com
  
  // ============================================================
  // WORKFLOW 1: Slack AI Auto-Responder
  // When someone messages in Slack → AI generates reply → Bot replies
  // ============================================================
  
  const slackNodes = [
    {
      id: 'slack_trigger',
      type: 'custom',
      data: {
        label: 'Slack',
        nodeType: 'Trigger',
        category: 'Apps',
        app: 'slack',
        icon: 'slack',
        event: 'new_message',
        description: 'Triggers when a new message is received in Slack'
      },
      position: { x: 100, y: 200 }
    },
    {
      id: 'ai_processor',
      type: 'custom',
      data: {
        label: 'AI Agent',
        nodeType: 'Action',
        category: 'AI',
        app: 'ai',
        icon: 'cpu',
        prompt: 'You are ORvexia, an intelligent AI assistant integrated into Slack. A team member just sent this message: "{{slack_trigger.Message_Text}}". Respond helpfully, concisely, and professionally. If the user is greeting you, introduce yourself as ORvexia - an AI-powered automation assistant. Keep responses under 200 words.',
        description: 'AI generates a contextual response'
      },
      position: { x: 400, y: 200 }
    },
    {
      id: 'slack_reply',
      type: 'custom',
      data: {
        label: 'Slack',
        nodeType: 'Action',
        category: 'Apps',
        app: 'slack',
        icon: 'slack',
        message: '{{ai_processor.Agent_Response}}',
        channel: '{{slack_trigger.Channel_ID}}',
        description: 'Sends the AI response back to Slack'
      },
      position: { x: 700, y: 200 }
    }
  ];

  const slackEdges = [
    { id: 'e_trigger_ai', source: 'slack_trigger', target: 'ai_processor' },
    { id: 'e_ai_reply', source: 'ai_processor', target: 'slack_reply' }
  ];

  // Create or update the Slack workflow
  let slackWorkflow = await Workflow.findOne({ owner_id: userId, name: 'Slack AI Auto-Responder' });
  if (!slackWorkflow) {
    slackWorkflow = await Workflow.create({
      name: 'Slack AI Auto-Responder',
      description: 'Automatically replies to Slack messages using Gemini AI',
      owner_id: userId,
      triggerSlug: 'slack-ai-auto-responder-' + Date.now(),
      is_active: true,
      stats: { total_runs: 0, success_rate: 0 }
    });
    console.log('Created Slack AI Auto-Responder workflow:', slackWorkflow._id);
  }

  const slackVersion = await WorkflowVersion.create({
    workflow_id: slackWorkflow._id,
    version: '3.0.' + Date.now(),
    definition: { nodes: slackNodes, edges: slackEdges }
  });

  slackWorkflow.active_version_id = slackVersion._id;
  slackWorkflow.is_active = true;
  await slackWorkflow.save();
  console.log('Slack AI Auto-Responder version created:', slackVersion._id);

  // ============================================================
  // WORKFLOW 2: Gmail → AI → Slack Notifier
  // When new email arrives → AI summarizes it → Posts summary to Slack
  // ============================================================

  const gmailNodes = [
    {
      id: 'gmail_trigger',
      type: 'custom',
      data: {
        label: 'Gmail',
        nodeType: 'Trigger',
        category: 'Apps',
        app: 'gmail',
        icon: 'mail',
        event: 'new_email',
        query: 'is:unread newer_than:15m',
        description: 'Triggers when a new unread email arrives'
      },
      position: { x: 100, y: 200 }
    },
    {
      id: 'ai_summarizer',
      type: 'custom',
      data: {
        label: 'AI Agent',
        nodeType: 'Action',
        category: 'AI',
        app: 'ai',
        icon: 'cpu',
        prompt: 'Summarize this email in 2-3 sentences. From: {{gmail_trigger.Sender}}, Subject: {{gmail_trigger.Subject}}, Body: {{gmail_trigger.Email_Body}}. Provide the summary in a format suitable for a Slack notification. Start with an emoji that matches the email topic.',
        description: 'AI summarizes the email content'
      },
      position: { x: 400, y: 200 }
    },
    {
      id: 'slack_notifier',
      type: 'custom',
      data: {
        label: 'Slack',
        nodeType: 'Action',
        category: 'Apps',
        app: 'slack',
        icon: 'slack',
        message: '*New Email Alert*\n*From:* {{gmail_trigger.Sender}}\n*Subject:* {{gmail_trigger.Subject}}\n\n{{ai_summarizer.Agent_Response}}',
        channel: '#general',
        description: 'Posts the email summary to Slack'
      },
      position: { x: 700, y: 200 }
    }
  ];

  const gmailEdges = [
    { id: 'e_gmail_ai', source: 'gmail_trigger', target: 'ai_summarizer' },
    { id: 'e_ai_slack', source: 'ai_summarizer', target: 'slack_notifier' }
  ];

  let gmailWorkflow = await Workflow.findOne({ owner_id: userId, name: 'Gmail to Slack Notifier' });
  if (!gmailWorkflow) {
    gmailWorkflow = await Workflow.create({
      name: 'Gmail to Slack Notifier',
      description: 'Summarizes new emails using AI and posts to Slack',
      owner_id: userId,
      triggerSlug: 'gmail-slack-notifier-' + Date.now(),
      is_active: true,
      stats: { total_runs: 0, success_rate: 0 }
    });
    console.log('Created Gmail to Slack Notifier workflow:', gmailWorkflow._id);
  }

  const gmailVersion = await WorkflowVersion.create({
    workflow_id: gmailWorkflow._id,
    version: '3.0.' + Date.now(),
    definition: { nodes: gmailNodes, edges: gmailEdges }
  });

  gmailWorkflow.active_version_id = gmailVersion._id;
  gmailWorkflow.is_active = true;
  await gmailWorkflow.save();
  console.log('Gmail to Slack Notifier version created:', gmailVersion._id);

  // ============================================================
  // Deactivate the old broken workflows
  // ============================================================
  const oldWorkflows = await Workflow.find({ 
    owner_id: userId, 
    name: 'NEW_ARCHITECTURE_MODULE' 
  });
  
  for (const old of oldWorkflows) {
    old.is_active = false;
    await old.save();
    console.log('Deactivated old workflow:', old._id, old.name);
  }

  // Also deactivate the old "Slack AI Assistant" from wrong owner
  const oldSlackAI = await Workflow.find({ name: 'Slack AI Assistant' });
  for (const old of oldSlackAI) {
    old.is_active = false;
    await old.save();
    console.log('Deactivated old Slack AI Assistant:', old._id);
  }

  console.log('\n=== DONE! Active workflows for user ===');
  const active = await Workflow.find({ owner_id: userId, is_active: true });
  for (const w of active) {
    console.log('  ' + w.name + ' (version: ' + w.active_version_id + ')');
  }

  process.exit(0);
}
fixWorkflows().catch(function(e) { console.error(e); process.exit(1); });
