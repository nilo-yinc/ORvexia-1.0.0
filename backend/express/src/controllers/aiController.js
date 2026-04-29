const AIService = require('../services/AIService');
const Workflow = require('../models/workflow-model');
const CopilotConversation = require('../models/copilotConversation-model');

// Smart local workflow templates when AI API is unavailable
const WORKFLOW_TEMPLATES = {
  'gmail_slack': {
    keywords: ['gmail', 'mail', 'email', 'slack'],
    minMatch: 2,
    blueprint: (nextId) => ({
      message: "I've built your Gmail → Slack automation. When a new email arrives in Gmail, it will automatically send a notification to your Slack channel.",
      actions: [
        { type: 'ADD_NODE', nodeType: 'Gmail', nodeId: `node_${nextId}`, role: 'trigger', config: { event: 'new_email', label: 'New Email Received' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'ADD_NODE', nodeType: 'Slack', nodeId: `node_${nextId + 1}`, role: 'action', config: { event: 'send_message', channel: '#general', messageTemplate: '📧 New email from {{sender}}: {{subject}}' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'CONNECT_NODES', source: `node_${nextId}`, target: `node_${nextId + 1}` },
      ]
    })
  },
  'gmail_drive': {
    keywords: ['gmail', 'mail', 'email', 'drive', 'attachment', 'file', 'save'],
    minMatch: 2,
    blueprint: (nextId) => ({
      message: "I've built your Gmail → Google Drive automation. Email attachments will be automatically saved to your Drive.",
      actions: [
        { type: 'ADD_NODE', nodeType: 'Gmail', nodeId: `node_${nextId}`, role: 'trigger', config: { event: 'new_email_with_attachment' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'ADD_NODE', nodeType: 'Google Drive', nodeId: `node_${nextId + 1}`, role: 'action', config: { event: 'upload_file', folder: '/Email Attachments' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'CONNECT_NODES', source: `node_${nextId}`, target: `node_${nextId + 1}` },
      ]
    })
  },
  'gmail_notion': {
    keywords: ['gmail', 'mail', 'email', 'notion', 'database', 'page'],
    minMatch: 2,
    blueprint: (nextId) => ({
      message: "I've built your Gmail → Notion automation. New emails will create entries in your Notion database.",
      actions: [
        { type: 'ADD_NODE', nodeType: 'Gmail', nodeId: `node_${nextId}`, role: 'trigger', config: { event: 'new_email' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'ADD_NODE', nodeType: 'Notion', nodeId: `node_${nextId + 1}`, role: 'action', config: { event: 'create_page', database: 'Inbox' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'CONNECT_NODES', source: `node_${nextId}`, target: `node_${nextId + 1}` },
      ]
    })
  },
  'github_slack': {
    keywords: ['github', 'repo', 'commit', 'pr', 'pull', 'issue', 'slack'],
    minMatch: 2,
    blueprint: (nextId) => ({
      message: "I've built your GitHub → Slack automation. GitHub events will be posted to your Slack channel.",
      actions: [
        { type: 'ADD_NODE', nodeType: 'GitHub', nodeId: `node_${nextId}`, role: 'trigger', config: { event: 'new_issue', repo: 'auto-detect' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'ADD_NODE', nodeType: 'Slack', nodeId: `node_${nextId + 1}`, role: 'action', config: { event: 'send_message', channel: '#dev', messageTemplate: '🔔 GitHub: {{event_type}} on {{repo}}' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'CONNECT_NODES', source: `node_${nextId}`, target: `node_${nextId + 1}` },
      ]
    })
  },
  'github_discord': {
    keywords: ['github', 'discord', 'commit', 'notification'],
    minMatch: 2,
    blueprint: (nextId) => ({
      message: "I've built your GitHub → Discord automation. Repository events will trigger Discord notifications.",
      actions: [
        { type: 'ADD_NODE', nodeType: 'GitHub', nodeId: `node_${nextId}`, role: 'trigger', config: { event: 'new_push' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'ADD_NODE', nodeType: 'Discord', nodeId: `node_${nextId + 1}`, role: 'action', config: { event: 'send_message', channel: 'general' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'CONNECT_NODES', source: `node_${nextId}`, target: `node_${nextId + 1}` },
      ]
    })
  },
  'webhook_slack': {
    keywords: ['webhook', 'slack', 'notify', 'alert', 'trigger'],
    minMatch: 2,
    blueprint: (nextId) => ({
      message: "I've built your Webhook → Slack automation. Incoming webhook data will be forwarded to Slack.",
      actions: [
        { type: 'ADD_NODE', nodeType: 'Webhook', nodeId: `node_${nextId}`, role: 'trigger', config: { event: 'receive_data' }, requiresAuth: false },
        { type: 'ADD_NODE', nodeType: 'Slack', nodeId: `node_${nextId + 1}`, role: 'action', config: { event: 'send_message', channel: '#alerts' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'CONNECT_NODES', source: `node_${nextId}`, target: `node_${nextId + 1}` },
      ]
    })
  },
  'slack_gmail': {
    keywords: ['slack', 'gmail', 'mail', 'email', 'send', 'forward'],
    minMatch: 2,
    blueprint: (nextId) => ({
      message: "I've built your Slack → Gmail automation. Slack messages will be forwarded via email.",
      actions: [
        { type: 'ADD_NODE', nodeType: 'Slack', nodeId: `node_${nextId}`, role: 'trigger', config: { event: 'new_message', channel: '#important' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'ADD_NODE', nodeType: 'Gmail', nodeId: `node_${nextId + 1}`, role: 'action', config: { event: 'send_email', to: '{{configured_email}}' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'CONNECT_NODES', source: `node_${nextId}`, target: `node_${nextId + 1}` },
      ]
    })
  },
  'typeform_gmail': {
    keywords: ['typeform', 'form', 'submission', 'gmail', 'email', 'mail'],
    minMatch: 2,
    blueprint: (nextId) => ({
      message: "I've built your Typeform → Gmail automation. Form submissions will trigger email notifications.",
      actions: [
        { type: 'ADD_NODE', nodeType: 'Typeform', nodeId: `node_${nextId}`, role: 'trigger', config: { event: 'new_submission' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'ADD_NODE', nodeType: 'Gmail', nodeId: `node_${nextId + 1}`, role: 'action', config: { event: 'send_email' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'CONNECT_NODES', source: `node_${nextId}`, target: `node_${nextId + 1}` },
      ]
    })
  },
  'calendly_slack': {
    keywords: ['calendly', 'calendar', 'meeting', 'schedule', 'slack'],
    minMatch: 2,
    blueprint: (nextId) => ({
      message: "I've built your Calendly → Slack automation. New bookings will post to Slack.",
      actions: [
        { type: 'ADD_NODE', nodeType: 'Calendly', nodeId: `node_${nextId}`, role: 'trigger', config: { event: 'new_event' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'ADD_NODE', nodeType: 'Slack', nodeId: `node_${nextId + 1}`, role: 'action', config: { event: 'send_message', channel: '#meetings' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'CONNECT_NODES', source: `node_${nextId}`, target: `node_${nextId + 1}` },
      ]
    })
  },
  'stripe_gmail': {
    keywords: ['stripe', 'payment', 'charge', 'gmail', 'email', 'invoice'],
    minMatch: 2,
    blueprint: (nextId) => ({
      message: "I've built your Stripe → Gmail automation. Payment events will trigger email notifications.",
      actions: [
        { type: 'ADD_NODE', nodeType: 'Stripe', nodeId: `node_${nextId}`, role: 'trigger', config: { event: 'payment_received' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'ADD_NODE', nodeType: 'Gmail', nodeId: `node_${nextId + 1}`, role: 'action', config: { event: 'send_email', subject: 'Payment Received: {{amount}}' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'CONNECT_NODES', source: `node_${nextId}`, target: `node_${nextId + 1}` },
      ]
    })
  },
  'gmail_filter_slack': {
    keywords: ['gmail', 'email', 'filter', 'condition', 'slack', 'important'],
    minMatch: 3,
    blueprint: (nextId) => ({
      message: "I've built a filtered Gmail → Slack pipeline. Emails matching your criteria will be forwarded to Slack.",
      actions: [
        { type: 'ADD_NODE', nodeType: 'Gmail', nodeId: `node_${nextId}`, role: 'trigger', config: { event: 'new_email' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'ADD_NODE', nodeType: 'Filter', nodeId: `node_${nextId + 1}`, role: 'logic', config: { condition: 'subject contains "urgent"' }, requiresAuth: false },
        { type: 'ADD_NODE', nodeType: 'Slack', nodeId: `node_${nextId + 2}`, role: 'action', config: { event: 'send_message', channel: '#urgent' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'CONNECT_NODES', source: `node_${nextId}`, target: `node_${nextId + 1}` },
        { type: 'CONNECT_NODES', source: `node_${nextId + 1}`, target: `node_${nextId + 2}` },
      ]
    })
  },
  'gmail_ops_suite': {
    keywords: ['gmail', 'calendar', 'meet', 'notion', 'slack', 'drive', 'docs', 'automation'],
    minMatch: 4,
    blueprint: (nextId) => ({
      message: "I've built a full Gmail operations automation: read incoming email, classify with AI, branch urgent cases to Calendar + Meet + Slack, archive context in Notion, then create Docs and save references in Drive.",
      planStages: [
        { stage: "TRIGGER", title: "Capture New Gmail Data", summary: "Watch incoming Gmail and pull latest message context." },
        { stage: "TRIAGE", title: "Understand Intent", summary: "Use AI + filters to detect urgency and route decisions." },
        { stage: "ACTION", title: "Execute Response", summary: "Create Calendar/Meet and notify Slack for urgent paths." },
        { stage: "ARCHIVE", title: "Persist Knowledge", summary: "Write outcomes to Notion, Google Docs, and Google Drive." },
      ],
      actions: [
        { type: 'ADD_NODE', nodeType: 'Gmail', nodeId: `node_${nextId}`, role: 'trigger', config: { action: 'read_latest', query: 'is:unread newer_than:1d' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'ADD_NODE', nodeType: 'AI Agent', nodeId: `node_${nextId + 1}`, role: 'action', config: { prompt: 'Analyze urgency and summarize this email. Output urgency and summary.' }, requiresAuth: false },
        { type: 'ADD_NODE', nodeType: 'Filter', nodeId: `node_${nextId + 2}`, role: 'logic', config: { condition: 'CONTAINS', payload: '{{node_' + (nextId + 1) + '.Agent_Response}}', filterTarget: 'urgent' }, requiresAuth: false },
        { type: 'ADD_NODE', nodeType: 'Google Calendar', nodeId: `node_${nextId + 3}`, role: 'action', config: { title: 'Urgent follow-up: {{node_' + nextId + '.Subject}}' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'ADD_NODE', nodeType: 'Google Meet', nodeId: `node_${nextId + 4}`, role: 'action', config: { title: 'Meet: {{node_' + nextId + '.Subject}}' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'ADD_NODE', nodeType: 'Slack', nodeId: `node_${nextId + 5}`, role: 'action', config: { message: 'Urgent email: {{node_' + nextId + '.Subject}}\\n{{node_' + (nextId + 1) + '.Agent_Response}}' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'ADD_NODE', nodeType: 'Notion', nodeId: `node_${nextId + 6}`, role: 'action', config: { page_title: 'Email log: {{node_' + nextId + '.Subject}}', content: '{{node_' + (nextId + 1) + '.Agent_Response}}' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'ADD_NODE', nodeType: 'Google Docs', nodeId: `node_${nextId + 7}`, role: 'action', config: { title: 'Email Summary {{node_' + nextId + '.Subject}}', content: '{{node_' + (nextId + 1) + '.Agent_Response}}' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'ADD_NODE', nodeType: 'Google Drive', nodeId: `node_${nextId + 8}`, role: 'action', config: { file_name: 'email-summary-{{node_' + nextId + '.Email_ID}}.txt' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'CONNECT_NODES', source: `node_${nextId}`, target: `node_${nextId + 1}` },
        { type: 'CONNECT_NODES', source: `node_${nextId + 1}`, target: `node_${nextId + 2}` },
        { type: 'CONNECT_NODES', source: `node_${nextId + 2}`, target: `node_${nextId + 3}` },
        { type: 'CONNECT_NODES', source: `node_${nextId + 3}`, target: `node_${nextId + 4}` },
        { type: 'CONNECT_NODES', source: `node_${nextId + 4}`, target: `node_${nextId + 5}` },
        { type: 'CONNECT_NODES', source: `node_${nextId + 5}`, target: `node_${nextId + 6}` },
        { type: 'CONNECT_NODES', source: `node_${nextId + 6}`, target: `node_${nextId + 7}` },
        { type: 'CONNECT_NODES', source: `node_${nextId + 7}`, target: `node_${nextId + 8}` },
      ]
    })
  },
};

const ACTION_INTENT_REGEX = /(send|forward|notify|create|save|reply|schedule|book|sync|upload|analy[sz]e|triage|draft|route|filter|check|read|write|update|monitor|automate|respond|summarize|summarise)/i;

const APP_NAMES = [
  'Gmail', 'Slack', 'GitHub', 'Notion', 'Google Drive', 'Google Keep',
  'Discord', 'Google Docs', 'Google Meet', 'Google Calendar',
  'Facebook', 'Instagram', 'Stripe', 'HubSpot', 'Typeform', 'Calendly', 'Cal.com'
];
const APP_NAMES_LOWER = APP_NAMES.map((name) => name.toLowerCase());
const APP_NODE_LABELS = new Set(APP_NAMES_LOWER);

const DECISION_TAKEOVER_REGEX = /(you decide|as needed|take all|take whatever|best way|you choose|handle everything)/i;
const CONNECTION_FIX_REGEX = /(connect|link|wire|join|fix).*?(node|flow|workflow)|connect.*properly|node.*not.*connect|repair.*connection/i;
const AUTO_REPLY_REGEX = /(auto[\s-]?reply|reply\s+automatically|gmail\s+reply|mail\s+reply)/i;
const CONTEXT_REFERENCE_REGEX = /(all\s+(?:these|those)?\s*(?:two|three|apps|services|tools|them)|all of them|these apps|those apps|this workflow|that workflow|use them all|take suitable example|suitable example|test all)/i;
const NEGATIVE_APP_REGEX = /(?:don'?t want|do not want|without|remove|exclude|not)\s+(gmail|slack|github|notion|google drive|google docs|google meet|google calendar|google keep|discord|hubspot|stripe|typeform|calendly|cal\.com)/gi;
const TOGGLE_ACTIVE_REGEX = /\b(pause|stop|deactivate|disable|halt|suspend)\b/i;
const TOGGLE_RESUME_REGEX = /\b(activate|resume|enable|live|start)\b/i;

const normalizeNodeType = (value = "") => String(value).trim().toLowerCase();
const sortNodesForFlow = (nodes = []) =>
  [...nodes].sort((a, b) => {
    const ay = Number(a?.position?.y || 0);
    const by = Number(b?.position?.y || 0);
    if (ay !== by) return ay - by;
    const ax = Number(a?.position?.x || 0);
    const bx = Number(b?.position?.x || 0);
    return ax - bx;
  });
const isStartNode = (node) => normalizeNodeType(node?.data?.label || node?.data?.app) === "start";
const inferNodeRole = (node) => {
  const nodeType = normalizeNodeType(node?.data?.nodeType);
  const category = normalizeNodeType(node?.data?.category);
  if (nodeType === "trigger" || category === "trigger" || isStartNode(node)) return "trigger";
  return "action";
};

const getMaxNodeIndex = (nodes = []) => {
  const indexes = nodes
    .map((node) => String(node?.id || ""))
    .map((id) => id.match(/^node_(\d+)$/))
    .filter(Boolean)
    .map((match) => Number(match[1]))
    .filter(Number.isFinite);
  return indexes.length ? Math.max(...indexes) : 0;
};

const edgeExists = (edges = [], source, target) => edges.some((edge) => edge.source === source && edge.target === target);
const normalizeTypos = (text = "") =>
  String(text)
    .toLowerCase()
    .replace(/\bgamil\b/g, "gmail")
    .replace(/\bgoogel\b/g, "google")
    .replace(/\bclaender\b/g, "calendar");

const getDetectedAppsFromText = (text = "") => {
  const normalized = normalizeTypos(text);
  const detected = APP_NAMES.filter((app) => normalized.includes(app.toLowerCase()));
  return [...new Set(detected)];
};

const mergeDetectedApps = (...groups) => {
  const merged = groups.flat().filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
  return [...new Set(merged)];
};

const getExcludedAppsFromText = (text = "") => {
  const normalized = normalizeTypos(text);
  const excluded = [];
  let match;
  while ((match = NEGATIVE_APP_REGEX.exec(normalized)) !== null) {
    excluded.push(String(match[1]).replace("cal.com", "Cal.com"));
  }
  return [...new Set(excluded.map((name) => {
    const found = APP_NAMES.find((app) => app.toLowerCase() === name.toLowerCase());
    return found || name;
  }))];
};

const extractOnlyAppConstraint = (prompt = "") => {
  const lower = String(prompt).toLowerCase();
  const hasOnlyMode = /\bonly\b|\bjust\b|\bno more\b|\bonly this\b/.test(lower);
  if (!hasOnlyMode) return [];
  return getDetectedAppsFromText(prompt);
};

const buildDefaultConfigForApp = (appName, role = "action", index = 0) => {
  const app = normalizeNodeType(appName);
  const isTrigger = normalizeNodeType(role) === "trigger";

  if (app === "gmail") {
    return isTrigger
      ? { action: "new_email", query: "is:unread newer_than:1d" }
      : { action: "auto_reply", subject: "Re: {{trigger.Subject}}", body: "Thanks for your email. We received your message and will reply shortly." };
  }

  if (app === "slack") {
    return isTrigger
      ? { action: "new_message", channel: "#general" }
      : { action: "send_message", channel: "#general", message: "📧 {{trigger.Subject}}\n{{trigger.Snippet}}" };
  }

  if (app === "notion") {
    return {
      action: "create_page",
      database: "Inbox",
      page_title: "{{trigger.Subject}}",
      content: "{{trigger.Snippet}}",
    };
  }

  if (app === "google drive") {
    return isTrigger ? { action: "new_file" } : { action: "upload_file", folder: "/Automation Files" };
  }

  if (app === "google docs") {
    return { action: "create_document", title: "Automation Output", content: "{{trigger.Snippet}}" };
  }

  if (app === "google calendar") {
    return isTrigger ? { action: "new_event" } : { action: "create_event", title: "Follow up: {{trigger.Subject}}" };
  }

  if (app === "google meet") {
    return isTrigger ? { action: "meeting_started" } : { action: "create_meeting", title: "Meet: {{trigger.Subject}}" };
  }

  if (app === "google keep") {
    return { action: "create_note", title: "{{trigger.Subject}}", content: "{{trigger.Snippet}}" };
  }

  return isTrigger ? { event: "new_event" } : { event: index === 0 ? "primary_action" : "followup_action" };
};

const buildLinearMultiAppActions = (apps = [], nextId = 1) => {
  const normalizedApps = [...new Set(apps.map((app) => String(app).trim()).filter(Boolean))];
  if (normalizedApps.length === 0) {
    return { actions: [], nodeOrder: [] };
  }

  const triggerPriority = ["gmail", "slack", "github", "webhook", "google calendar", "google drive", "notion"];
  const triggerApp =
    normalizedApps.find((app) => triggerPriority.includes(normalizeNodeType(app))) ||
    normalizedApps[0];
  const actionApps = normalizedApps.filter((app) => app !== triggerApp);
  const orderedApps = [triggerApp, ...actionApps];

  const actions = [];
  const nodeOrder = [];
  let currentId = nextId;

  orderedApps.forEach((appName, index) => {
    const nodeId = `node_${currentId++}`;
    const role = index === 0 ? "trigger" : "action";
    const lower = normalizeNodeType(appName);
    actions.push({
      type: "ADD_NODE",
      nodeType: appName,
      nodeId,
      role,
      config: buildDefaultConfigForApp(appName, role, index),
      requiresAuth: APP_NODE_LABELS.has(lower),
      authType: APP_NODE_LABELS.has(lower) ? "oauth2" : "",
    });
    nodeOrder.push(nodeId);
  });

  for (let index = 0; index < nodeOrder.length - 1; index += 1) {
    actions.push({
      type: "CONNECT_NODES",
      source: nodeOrder[index],
      target: nodeOrder[index + 1],
    });
  }

  return { actions, nodeOrder, orderedApps };
};

const buildOnlyAppsPlan = (allowedApps = [], currentNodes = [], currentEdges = []) => {
  const allowedSet = new Set(allowedApps.map((name) => String(name).toLowerCase()));
  const appNodes = currentNodes.filter((node) => APP_NODE_LABELS.has(normalizeNodeType(node?.data?.label || node?.data?.app)));
  const startNodes = currentNodes.filter((node) => isStartNode(node));
  const nonAppNonStartNodes = currentNodes.filter((node) => !APP_NODE_LABELS.has(normalizeNodeType(node?.data?.label || node?.data?.app)) && !isStartNode(node));

  const removeIdSet = new Set();

  // Remove all non-allowed app nodes first.
  appNodes.forEach((node) => {
    const app = normalizeNodeType(node?.data?.label || node?.data?.app);
    if (!allowedSet.has(app)) removeIdSet.add(node.id);
  });

  // In strict "only app" mode, remove logic/utility nodes too to keep a clean minimal flow.
  nonAppNonStartNodes.forEach((node) => removeIdSet.add(node.id));
  startNodes.forEach((node) => removeIdSet.add(node.id));

  const keepNodes = currentNodes.filter((node) => !removeIdSet.has(node.id) && !isStartNode(node));
  const keepNodeIds = new Set(keepNodes.map((node) => node.id));
  const keepEdges = currentEdges.filter((edge) => keepNodeIds.has(edge.source) && keepNodeIds.has(edge.target));

  const maxId = getMaxNodeIndex(keepNodes);
  let nextId = maxId + 1;

  const existingByApp = new Map();
  keepNodes.forEach((node) => {
    const app = normalizeNodeType(node?.data?.label || node?.data?.app);
    if (!allowedSet.has(app)) return;
    if (!existingByApp.has(app)) existingByApp.set(app, []);
    existingByApp.get(app).push(node);
  });

  const pickOrCreate = (appName, roleHint = "action") => {
    const normalized = normalizeNodeType(appName);
    const pool = existingByApp.get(normalized) || [];
    const preferred =
      pool.find((node) => inferNodeRole(node) === roleHint) ||
      (roleHint === "trigger"
        ? pool.find((node) => inferNodeRole(node) !== "action")
        : pool.find((node) => inferNodeRole(node) === "action")) ||
      pool[0];
    if (preferred) return { id: preferred.id, created: false };
    const id = `node_${nextId++}`;
    if (!existingByApp.has(normalized)) existingByApp.set(normalized, []);
    existingByApp.get(normalized).push({
      id,
      data: {
        label: appName,
        nodeType: roleHint === "trigger" ? "Trigger" : "Action",
        category: roleHint === "trigger" ? "Trigger" : "Apps",
      },
    });
    return { id, created: true };
  };

  if (allowedApps.length >= 2) {
    // Strict multi-app mode should preserve the user's full app scope, not collapse it
    // down to a single trigger/action pair.
    keepNodes.forEach((node) => {
      if (!isStartNode(node)) removeIdSet.add(node.id);
    });

    const removeActions = [...removeIdSet].map((nodeId) => ({ type: "REMOVE_NODE", nodeId }));
    const linearPlan = buildLinearMultiAppActions(allowedApps, nextId);
    const actions = [...removeActions, ...linearPlan.actions];
    return {
      message: `Done. I rebuilt a strict ${allowedApps.join(" + ")} automation path with all requested apps included.`,
      needsClarification: false,
      followUpQuestions: [],
      assumptions: ["Applied strict app scope from your latest instruction.", "Used the first suitable app as trigger and chained the remaining requested apps as actions."],
      actions,
      flowDefinition: buildFreshDefinitionFromActions(actions, []),
    };
  }

  // Single-app strict mode: build a complete executable path, not just cleanup.
  if (allowedApps.length === 1) {
    const app = allowedApps[0];
    const appLower = normalizeNodeType(app);
    const singleActions = [];

    // Hard reset for strict single-app mode:
    // remove all non-start nodes (including previously kept same-app nodes)
    keepNodes.forEach((node) => {
      if (!isStartNode(node)) removeIdSet.add(node.id);
    });
    const removeActions = [...removeIdSet].map((nodeId) => ({ type: "REMOVE_NODE", nodeId }));

    if (appLower === "gmail") {
      const triggerId = `node_${nextId++}`;
      const actionId = `node_${nextId++}`;
      singleActions.push({
        type: "ADD_NODE",
        nodeType: "Gmail",
        nodeId: triggerId,
        role: "trigger",
        config: { action: "new_email", query: "is:unread newer_than:1d" },
        requiresAuth: true,
        authType: "oauth2",
      });
      singleActions.push({
        type: "ADD_NODE",
        nodeType: "Gmail",
        nodeId: actionId,
        role: "action",
        config: {
          action: "auto_reply",
          subject: "Re: {{trigger.Subject}}",
          body: "Thanks for your email. We received your message and will reply shortly.",
        },
        requiresAuth: true,
        authType: "oauth2",
      });
      singleActions.push({ type: "CONNECT_NODES", source: triggerId, target: actionId });

      const actions = [...removeActions, ...singleActions];
      return {
        message: "Done. I built a strict Gmail-only automation with auto-reply.",
        needsClarification: false,
        followUpQuestions: [],
        assumptions: ["Applied strict app scope from your latest instruction."],
        actions,
        flowDefinition: buildFreshDefinitionFromActions(actions, keepNodes),
      };
    }

    // Generic single-app strict baseline
    const triggerId = `node_${nextId++}`;
    const outputNodeId = `node_${nextId++}`;
    singleActions.push({
      type: "ADD_NODE",
      nodeType: app,
      nodeId: triggerId,
      role: "trigger",
      config: { event: "new_event" },
      requiresAuth: true,
      authType: "oauth2",
    });
    singleActions.push({
      type: "ADD_NODE",
      nodeType: "Output",
      nodeId: outputNodeId,
      role: "action",
      config: { payload: "{{trigger}}" },
      requiresAuth: false,
    });
    singleActions.push({ type: "CONNECT_NODES", source: triggerId, target: outputNodeId });

    const actions = [...removeActions, ...singleActions];
    return {
      message: `Done. I built a strict ${app}-only automation baseline flow.`,
      needsClarification: false,
      followUpQuestions: [],
      assumptions: ["Applied strict app scope from your latest instruction."],
      actions,
      flowDefinition: buildFreshDefinitionFromActions(actions, keepNodes),
    };
  }

  const removeActions = [...removeIdSet].map((nodeId) => ({ type: "REMOVE_NODE", nodeId }));
  return {
    message: `Done. I kept only ${allowedApps.join(", ")} nodes in this flow.`,
    needsClarification: false,
    followUpQuestions: [],
    assumptions: ["Applied strict app scope from your latest instruction."],
    actions: [...removeActions],
    flowDefinition: buildFreshDefinitionFromActions(removeActions, keepNodes),
  };
};

const buildFreshDefinitionFromActions = (actions = [], baseNodes = []) => {
  const nodesById = new Map();
  const edges = [];
  const removeIdSet = new Set(
    actions
      .filter((action) => action?.type === "REMOVE_NODE" && action?.nodeId)
      .map((action) => String(action.nodeId))
  );

  // Carry forward existing nodes referenced by strict plans so reused nodes are preserved.
  if (Array.isArray(baseNodes)) {
    baseNodes.forEach((node) => {
      const nodeId = String(node?.id || "").trim();
      if (!nodeId || removeIdSet.has(nodeId) || isStartNode(node)) return;
      if (nodesById.has(nodeId)) return;
      nodesById.set(nodeId, {
        id: nodeId,
        type: "custom",
        position: {
          x: Number(node?.position?.x ?? 360),
          y: Number(node?.position?.y ?? 280),
        },
        data: {
          ...(node?.data || {}),
          label: node?.data?.label || node?.data?.app || "Action",
          app: node?.data?.app || node?.data?.label || "Action",
          nodeType: node?.data?.nodeType || "Action",
          category: node?.data?.category || "Apps",
          config: node?.data?.config || {},
        },
      });
    });
  }

  const addEdgeSafe = (source, target) => {
    if (!source || !target || source === target) return;
    if (!nodesById.has(source) || !nodesById.has(target)) return;
    if (edges.some((edge) => edge.source === source && edge.target === target)) return;
    edges.push({
      id: `e-${source}-${target}`,
      source,
      target,
      type: "custom",
    });
  };

  const addNodeActions = actions.filter((action) => action?.type === "ADD_NODE");
  let y = 280;
  addNodeActions.forEach((action) => {
    const nodeId = String(action.nodeId || "").trim();
    if (!nodeId || nodesById.has(nodeId)) return;
    nodesById.set(nodeId, {
      id: nodeId,
      type: "custom",
      position: { x: 360, y },
      data: {
        label: action.nodeType,
        app: action.nodeType,
        nodeType: normalizeNodeType(action.role) === "trigger" ? "Trigger" : "Action",
        category: normalizeNodeType(action.role) === "trigger" ? "Trigger" : "Apps",
        config: action.config || {},
        requiresAuth: Boolean(action.requiresAuth),
        authType: action.authType || "",
      },
    });
    y += 170;
  });

  actions
    .filter((action) => action?.type === "CONNECT_NODES")
    .forEach((action) => addEdgeSafe(action.source, action.target));

  const currentNodes = [...nodesById.values()];
  const triggerNode = currentNodes.find((node) => inferNodeRole(node) === "trigger");
  const actionNodes = currentNodes.filter((node) => inferNodeRole(node) === "action");

  if (triggerNode && !edges.some((edge) => edge.target === triggerNode.id)) {
    const rootNode = sortNodesForFlow(currentNodes)[0];
    if (rootNode && rootNode.id !== triggerNode.id) {
      addEdgeSafe(rootNode.id, triggerNode.id);
    }
  }

  if (triggerNode && actionNodes.length > 0) {
    const sortedActions = [...actionNodes].sort((a, b) => {
      const ay = Number(a?.position?.y || 0);
      const by = Number(b?.position?.y || 0);
      return ay - by;
    });
    if (!edges.some((edge) => edge.source === triggerNode.id)) {
      addEdgeSafe(triggerNode.id, sortedActions[0].id);
    }
    for (let i = 0; i < sortedActions.length - 1; i += 1) {
      const source = sortedActions[i].id;
      const target = sortedActions[i + 1].id;
      if (!edges.some((edge) => edge.source === source && edge.target === target)) {
        addEdgeSafe(source, target);
      }
    }
  }

  return {
    nodes: [...nodesById.values()],
    edges,
  };
};

const buildReconnectPlan = (nodes = [], edges = []) => {
  if (!Array.isArray(nodes) || nodes.length < 2) return null;

  const orderedNodes = nodes
    .filter((node) => !isStartNode(node))
    .sort((a, b) => {
      const ay = Number(a?.position?.y || 0);
      const by = Number(b?.position?.y || 0);
      if (ay !== by) return ay - by;
      const ax = Number(a?.position?.x || 0);
      const bx = Number(b?.position?.x || 0);
      return ax - bx;
    });
  if (orderedNodes.length < 2) return null;
  const connectActions = [];
  for (let i = 0; i < orderedNodes.length - 1; i += 1) {
    const source = orderedNodes[i]?.id;
    const target = orderedNodes[i + 1]?.id;
    if (!source || !target || source === target || edgeExists(edges, source, target)) continue;
    connectActions.push({ type: "CONNECT_NODES", source, target });
  }

  if (connectActions.length === 0) {
    return {
      message: "Your workflow is already connected in sequence. I did not add duplicate links.",
      actions: [],
      needsClarification: false,
      followUpQuestions: [],
      assumptions: [],
    };
  }

  return {
    message: `I repaired your flow connectivity and added ${connectActions.length} missing connection(s).`,
    actions: connectActions,
    needsClarification: false,
    followUpQuestions: [],
    assumptions: ["Connections were rebuilt using current canvas order (top-to-bottom)."],
  };
};

const reconcilePlanWithExistingWorkflow = (plan, currentNodes = [], currentEdges = []) => {
  if (!plan || !Array.isArray(plan.actions)) return plan;

  const existingNodes = Array.isArray(currentNodes) ? currentNodes : [];
  const existingEdges = Array.isArray(currentEdges) ? currentEdges : [];
  const nodesPlannedForRemoval = new Set(
    plan.actions
      .filter((action) => action?.type === "REMOVE_NODE" && action?.nodeId)
      .map((action) => String(action.nodeId))
  );
  const reservedIds = new Set(existingNodes.map((node) => node.id));
  const virtualAdded = [];
  const idMap = new Map();
  let nextIndex = getMaxNodeIndex(existingNodes) + 1;

  const findReusableNodeId = (nodeType, role) => {
    const normalizedType = normalizeNodeType(nodeType);
    const expectedRole = normalizeNodeType(role);
    if (!normalizedType || normalizedType === "start") return null;

    const pool = [...existingNodes, ...virtualAdded].filter((node) => !nodesPlannedForRemoval.has(String(node?.id || "")));
    const match = pool.find((node) => {
      const labelType = normalizeNodeType(node?.data?.label || node?.data?.app);
      if (labelType !== normalizedType) return false;
      if (!expectedRole) return true;
      return inferNodeRole(node) === expectedRole;
    });
    return match?.id || null;
  };

  const normalizedActions = [];
  for (const action of plan.actions) {
    if (!action || typeof action !== "object") continue;
    if (action.type === "ADD_NODE") {
      const requestedId = String(action.nodeId || "");
      const reusableId = findReusableNodeId(action.nodeType, action.role);
      if (reusableId) {
        if (requestedId) idMap.set(requestedId, reusableId);
        continue;
      }

      let resolvedId = requestedId;
      if (!resolvedId || reservedIds.has(resolvedId)) {
        resolvedId = `node_${nextIndex++}`;
      }
      reservedIds.add(resolvedId);
      if (requestedId && requestedId !== resolvedId) idMap.set(requestedId, resolvedId);
      if (requestedId && requestedId === resolvedId) idMap.set(requestedId, resolvedId);

      normalizedActions.push({ ...action, nodeId: resolvedId });
      virtualAdded.push({
        id: resolvedId,
        data: {
          label: action.nodeType,
          nodeType: normalizeNodeType(action.role) === "trigger" ? "Trigger" : "Action",
          category: normalizeNodeType(action.role) === "trigger" ? "Trigger" : "Actions",
        },
      });
      continue;
    }

    if (action.type === "CONNECT_NODES") {
      const source = idMap.get(String(action.source || "")) || action.source;
      const target = idMap.get(String(action.target || "")) || action.target;
      if (!source || !target || source === target) continue;
      if (edgeExists(existingEdges, source, target)) continue;
      if (normalizedActions.some((a) => a.type === "CONNECT_NODES" && a.source === source && a.target === target)) continue;
      normalizedActions.push({ ...action, source, target });
      continue;
    }

    normalizedActions.push(action);
  }

  const hasAddNode = normalizedActions.some((action) => action.type === "ADD_NODE");
  const hasConnect = normalizedActions.some((action) => action.type === "CONNECT_NODES");
  if (hasAddNode && !hasConnect) {
    const addedIds = normalizedActions.filter((action) => action.type === "ADD_NODE").map((action) => action.nodeId);
    const triggerNode = [...existingNodes, ...virtualAdded].find((node) => inferNodeRole(node) === "trigger");
    const connectActions = [];
    if (addedIds.length > 0 && triggerNode && triggerNode.id !== addedIds[0] && !edgeExists(existingEdges, triggerNode.id, addedIds[0])) {
      connectActions.push({ type: "CONNECT_NODES", source: triggerNode.id, target: addedIds[0] });
    }
    for (let i = 0; i < addedIds.length - 1; i += 1) {
      const source = addedIds[i];
      const target = addedIds[i + 1];
      if (!edgeExists(existingEdges, source, target)) {
        connectActions.push({ type: "CONNECT_NODES", source, target });
      }
    }
    normalizedActions.push(...connectActions);
  }

  return {
    ...plan,
    actions: normalizedActions,
  };
};

const sanitizeHistory = (chatHistory = []) => {
  if (!Array.isArray(chatHistory)) return [];
  return chatHistory
    .filter((item) => item && typeof item.text === "string" && typeof item.role === "string")
    .slice(-14)
    .map((item) => ({
      role: String(item.role).toUpperCase(),
      text: item.text.trim().slice(0, 320),
    }));
};

const historyToText = (history = []) => history.map((item) => `${item.role}: ${item.text}`).join("\n");

const sanitizeConversationMessages = (messages = []) => {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((item) => item && typeof item.text === "string" && typeof item.role === "string")
    .slice(-150)
    .map((item) => ({
      id: item.id ?? Date.now(),
      role: ["user", "ai", "system"].includes(String(item.role)) ? String(item.role) : "system",
      text: item.text.trim().slice(0, 2400),
      type: typeof item.type === "string" ? item.type : "",
      timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
    }))
    .filter((item) => item.text.length > 0);
};

const verifyWorkflowOwnership = async (workflowId, ownerId) => {
  if (!workflowId) return false;
  const workflow = await Workflow.findById(workflowId).select("_id owner_id");
  if (!workflow) return false;
  return String(workflow.owner_id) === String(ownerId);
};

const attachBuildGuidance = (result) => {
  if (!result || !Array.isArray(result.actions) || result.actions.length === 0) return result;
  return {
    ...result,
    postBuildChecklist: [
      "Click COMMIT_CHANGES to save this workflow version.",
      "I connected the generated nodes automatically and kept data mapping defaults.",
      "If any app permission is missing, connect it from the bottom auth bar and I will auto-resume.",
      "Use EXECUTE_FLOW once to verify the live path in TELEMETRY_STREAM.",
      "For live triggers (Slack/Webhook), keep workflow active and verify incoming events in logs."
    ]
  };
};

const buildClarificationResponse = (prompt, detectedApps = []) => {
  const appText = detectedApps.length ? ` I detected: ${detectedApps.join(", ")}.` : "";
  const delegated = DECISION_TAKEOVER_REGEX.test(String(prompt || ""));
  const followUpQuestions = [];

  if (!delegated && detectedApps.length < 2) {
    followUpQuestions.push("Which app should be the trigger source?");
    followUpQuestions.push("Which app should receive the final action?");
  }

  if (!delegated) {
    followUpQuestions.push("What exact output should happen (for example: send message, create doc, auto-reply, schedule meet)?");
    followUpQuestions.push("Should this run instantly on every event or only when a filter condition is matched?");
  }

  if (delegated && detectedApps.length > 0) {
    return {
      needsClarification: false,
      message: `I understand the request and will proceed with a practical default workflow.${appText}`,
      followUpQuestions: [],
      assumptions: ["Proceeding with autonomous defaults because you asked me to choose suitable examples."],
      actions: [],
    };
  }

  return {
    needsClarification: true,
    message: `I understand the request, but I need 2 quick details before building a reliable workflow.${appText}`,
    followUpQuestions,
    actions: [],
  };
};

const buildSingleAppPlan = (app, nextId, prompt = "", historyText = "") => {
  const lower = `${historyText}\n${prompt}`.toLowerCase();
  const appLower = String(app || "").toLowerCase();

  if (appLower === "gmail") {
    if (AUTO_REPLY_REGEX.test(lower) || /\breply\b/.test(lower)) {
      return attachBuildGuidance({
        message: "Built a Gmail auto-reply flow. New Gmail messages will trigger an automatic reply.",
        needsClarification: false,
        followUpQuestions: [],
        assumptions: [],
        actions: [
          { type: 'ADD_NODE', nodeType: 'Gmail', nodeId: `node_${nextId}`, role: 'trigger', config: { action: 'new_email', query: 'is:unread newer_than:1d' }, requiresAuth: true, authType: 'oauth2' },
          { type: 'ADD_NODE', nodeType: 'Gmail', nodeId: `node_${nextId + 1}`, role: 'action', config: { action: 'auto_reply', subject: 'Re: {{trigger.Subject}}', body: 'Thanks for your email. We received your message and will get back to you shortly.' }, requiresAuth: true, authType: 'oauth2' },
          { type: 'CONNECT_NODES', source: `node_${nextId}`, target: `node_${nextId + 1}` },
        ],
      });
    }
    return attachBuildGuidance({
      message: "Built a Gmail monitoring flow. It watches new emails and prepares the event payload for next steps.",
      needsClarification: false,
      followUpQuestions: [],
      assumptions: ["No target app was provided, so I built a Gmail-only trigger flow."],
      actions: [
        { type: 'ADD_NODE', nodeType: 'Gmail', nodeId: `node_${nextId}`, role: 'trigger', config: { action: 'new_email', query: 'is:unread newer_than:1d' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'ADD_NODE', nodeType: 'Output', nodeId: `node_${nextId + 1}`, role: 'action', config: { payload: '{{trigger}}' }, requiresAuth: false },
        { type: 'CONNECT_NODES', source: `node_${nextId}`, target: `node_${nextId + 1}` },
      ],
    });
  }

  if (appLower === "slack") {
    return attachBuildGuidance({
      message: "Built a Slack listener flow. It captures new messages and prepares them for automated handling.",
      needsClarification: false,
      followUpQuestions: [],
      assumptions: ["No second app was provided, so I built a Slack-only trigger flow."],
      actions: [
        { type: 'ADD_NODE', nodeType: 'Slack', nodeId: `node_${nextId}`, role: 'trigger', config: { action: 'new_message', channel: '#general' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'ADD_NODE', nodeType: 'Output', nodeId: `node_${nextId + 1}`, role: 'action', config: { payload: '{{trigger}}' }, requiresAuth: false },
        { type: 'CONNECT_NODES', source: `node_${nextId}`, target: `node_${nextId + 1}` },
      ],
    });
  }

  return attachBuildGuidance({
    message: `Built a ${app} automation baseline with trigger + output. You can now extend actions in one click.`,
    needsClarification: false,
    followUpQuestions: [],
    assumptions: ["Single-app intent detected; created a practical baseline flow."],
    actions: [
      { type: 'ADD_NODE', nodeType: app, nodeId: `node_${nextId}`, role: 'trigger', config: { event: 'new_event' }, requiresAuth: true, authType: 'oauth2' },
      { type: 'ADD_NODE', nodeType: 'Output', nodeId: `node_${nextId + 1}`, role: 'action', config: { payload: '{{trigger}}' }, requiresAuth: false },
      { type: 'CONNECT_NODES', source: `node_${nextId}`, target: `node_${nextId + 1}` },
    ],
  });
};

const normalizeArchitectResult = (result, prompt) => {
  if (!result || typeof result !== "object") return buildClarificationResponse(prompt, []);
  const normalized = {
    message: typeof result.message === "string" && result.message.trim()
      ? result.message.trim()
      : "Workflow plan generated.",
    actions: Array.isArray(result.actions) ? result.actions : [],
    planStages: Array.isArray(result.planStages) ? result.planStages : [],
    needsClarification: Boolean(result.needsClarification),
    followUpQuestions: Array.isArray(result.followUpQuestions) ? result.followUpQuestions : [],
    assumptions: Array.isArray(result.assumptions) ? result.assumptions : [],
  };
  if (normalized.needsClarification || normalized.actions.length === 0) return normalized;
  return attachBuildGuidance(normalized);
};

// Match user prompt to a template
function matchTemplate(prompt, nextId, historyText = "") {
  const combined = `${historyText}\n${prompt}`.trim();
  const lower = combined.toLowerCase();
  const promptLower = String(prompt || "").toLowerCase();
  const promptApps = getDetectedAppsFromText(prompt);
  const historyApps = getDetectedAppsFromText(historyText);
  const combinedApps = mergeDetectedApps(promptApps, historyApps);
  const excludedApps = getExcludedAppsFromText(prompt);
  const referencesPriorApps = CONTEXT_REFERENCE_REGEX.test(promptLower);
  // Strong single-intent guard: if user explicitly asks Gmail auto-reply and does not mention Slack,
  // never drift to cross-app templates from history context.
  if (promptApps.length === 1 && String(promptApps[0]).toLowerCase() === "gmail" && AUTO_REPLY_REGEX.test(promptLower)) {
    return buildSingleAppPlan("Gmail", nextId, prompt, historyText);
  }
  const onlyApps = extractOnlyAppConstraint(prompt);
  const onlyAppsLower = onlyApps.map((a) => a.toLowerCase());
  const excludedAppsLower = excludedApps.map((a) => a.toLowerCase());
  if (combinedApps.length >= 3 && (promptApps.length >= 3 || referencesPriorApps || ACTION_INTENT_REGEX.test(lower) || DECISION_TAKEOVER_REGEX.test(promptLower))) {
    const linearPlan = buildLinearMultiAppActions(combinedApps, nextId);
    return attachBuildGuidance({
      message: `I've built your ${linearPlan.orderedApps.join(" -> ")} automation workflow and included all requested apps.`,
      needsClarification: false,
      followUpQuestions: [],
      assumptions: [promptApps.length >= 3 ? "Included every app explicitly mentioned in your prompt." : "Included every app referenced in this conversation context."],
      actions: linearPlan.actions,
    });
  }
  const priorityText = promptApps.length > 0 ? promptLower : lower;
  let bestMatch = null;
  let bestScore = 0;

  const shouldSkipNarrowTemplates =
    combinedApps.length >= 3 &&
    (referencesPriorApps || promptApps.length >= 3 || ACTION_INTENT_REGEX.test(lower) || DECISION_TAKEOVER_REGEX.test(promptLower));

  for (const [key, template] of Object.entries(WORKFLOW_TEMPLATES)) {
    if (shouldSkipNarrowTemplates && key !== "gmail_ops_suite") continue;
    const score = template.keywords.filter((kw) => priorityText.includes(kw)).length;
    const templateApps = APP_NAMES.filter((app) => template.keywords.includes(app.toLowerCase())).map((a) => a.toLowerCase());
    const containsDisallowedApp = onlyApps.length > 0 && templateApps.some((app) => !onlyAppsLower.includes(app));
    const containsExcludedApp = excludedAppsLower.length > 0 && templateApps.some((app) => excludedAppsLower.includes(app));
    if (containsDisallowedApp || containsExcludedApp) continue;
    if (score >= template.minMatch && score > bestScore) {
      bestScore = score;
      bestMatch = template;
    }
  }

  if (bestMatch) {
    return attachBuildGuidance(bestMatch.blueprint(nextId));
  }

  // Generic single-node fallback: try to detect an app name
  const detectedAppsRaw = combinedApps.length > 0 ? combinedApps : APP_NAMES.filter(app => lower.includes(app.toLowerCase()));
  const detectedApps = detectedAppsRaw.filter((app) => !excludedAppsLower.includes(app.toLowerCase()));
  const hasActionIntent = ACTION_INTENT_REGEX.test(prompt) || ACTION_INTENT_REGEX.test(historyText);
  const userDelegatedDecision = DECISION_TAKEOVER_REGEX.test(promptLower);
  
  if (detectedApps.length >= 2) {
    const linearPlan = buildLinearMultiAppActions(detectedApps, nextId);
    const orderedApps = linearPlan.orderedApps || detectedApps;
    const source = orderedApps[0];
    return attachBuildGuidance({
      message: `I've built your ${orderedApps.join(" -> ")} automation workflow.`,
      assumptions: userDelegatedDecision || referencesPriorApps
        ? [`Using ${source} as trigger source based on your instruction to proceed autonomously.`]
        : [],
      actions: linearPlan.actions
    });
  }
  
  if (userDelegatedDecision && detectedApps.length >= 1) {
    const app = detectedApps[0];
    if (String(app).toLowerCase() === "slack") {
      return attachBuildGuidance({
        message: "I built a complete Slack assistant flow: trigger on Slack message, draft with AI, then reply in Slack.",
        assumptions: ["Using Slack as both trigger and action channel because you asked me to choose defaults."],
        actions: [
          { type: 'ADD_NODE', nodeType: 'Slack', nodeId: `node_${nextId}`, role: 'trigger', config: { action: 'new_message', event: 'new_message' }, requiresAuth: true, authType: 'oauth2' },
          { type: 'ADD_NODE', nodeType: 'AI Agent', nodeId: `node_${nextId + 1}`, role: 'action', config: { prompt: 'Write a friendly helpful reply to this Slack message: {{slack_event.text}}' }, requiresAuth: false },
          { type: 'ADD_NODE', nodeType: 'Slack', nodeId: `node_${nextId + 2}`, role: 'action', config: { message: '{{node_' + (nextId + 1) + '.Agent_Response}}' }, requiresAuth: true, authType: 'oauth2' },
          { type: 'CONNECT_NODES', source: `node_${nextId}`, target: `node_${nextId + 1}` },
          { type: 'CONNECT_NODES', source: `node_${nextId + 1}`, target: `node_${nextId + 2}` },
        ],
      });
    }

    return attachBuildGuidance({
      message: `I will proceed with a practical autonomous default using ${app}: trigger, AI processing, and output handoff.`,
      assumptions: ["Proceeding with autonomous defaults because you asked me to take required decisions."],
      actions: [
        { type: 'ADD_NODE', nodeType: app, nodeId: `node_${nextId}`, role: 'trigger', config: { event: 'new_event' }, requiresAuth: true, authType: 'oauth2' },
        { type: 'ADD_NODE', nodeType: 'AI Agent', nodeId: `node_${nextId + 1}`, role: 'action', config: { prompt: 'Analyze the incoming event and generate the best next action payload.' }, requiresAuth: false },
        { type: 'ADD_NODE', nodeType: 'Output', nodeId: `node_${nextId + 2}`, role: 'action', config: { payload: '{{node_' + (nextId + 1) + '.Agent_Response}}' }, requiresAuth: false },
        { type: 'CONNECT_NODES', source: `node_${nextId}`, target: `node_${nextId + 1}` },
        { type: 'CONNECT_NODES', source: `node_${nextId + 1}`, target: `node_${nextId + 2}` },
      ],
    });
  }

  if (detectedApps.length === 1 && (hasActionIntent || userDelegatedDecision || /automation|workflow|build|setup|connect|auto|reply|send|create|schedule|sync|notify|assistant/.test(promptLower))) {
    return buildSingleAppPlan(detectedApps[0], nextId, prompt, historyText);
  }

  if (!hasActionIntent && detectedApps.length === 0) {
    return buildClarificationResponse(prompt, detectedApps);
  }

  return buildClarificationResponse(prompt, detectedApps);
}

exports.architect = async (req, res) => {
  try {
    const { prompt, currentNodes, currentEdges, chatHistory } = req.body;
    const safeNodes = Array.isArray(currentNodes) ? currentNodes : [];
    const safeEdges = Array.isArray(currentEdges) ? currentEdges : [];
    const safeHistory = sanitizeHistory(chatHistory);
    const historyText = historyToText(safeHistory);
    const nextIdNum = getMaxNodeIndex(safeNodes) + 1;

    // Deterministic short-circuit for common explicit intents to avoid LLM drift/repetition.
    const promptLower = normalizeTypos(prompt || "");
    const excludedApps = getExcludedAppsFromText(prompt || "");
    const explicitGmailOnly =
      /\b(only|just)\b/.test(promptLower) &&
      /\bgmail\b/.test(promptLower) &&
      !/\bslack\b/.test(promptLower);
    const explicitGmailAutoReply = /\bgmail\b/.test(promptLower) && AUTO_REPLY_REGEX.test(promptLower) && !/\bslack\b/.test(promptLower);
    if (explicitGmailOnly || explicitGmailAutoReply) {
      const strictPlan = buildOnlyAppsPlan(["Gmail"], safeNodes, safeEdges);
      return res.json({ status: "success", ...normalizeArchitectResult(strictPlan, prompt) });
    }

    const onlyApps = extractOnlyAppConstraint(prompt);
    if (onlyApps.length > 0) {
      const strictPlan = buildOnlyAppsPlan(onlyApps, safeNodes, safeEdges);
      return res.json({ status: 'success', ...normalizeArchitectResult(strictPlan, prompt) });
    }
    if (excludedApps.length > 0) {
      const requested = getDetectedAppsFromText(prompt).filter((app) => !excludedApps.map((e) => e.toLowerCase()).includes(app.toLowerCase()));
      if (requested.length > 0) {
        const strictPlan = buildOnlyAppsPlan(requested, safeNodes, safeEdges);
        return res.json({ status: "success", ...normalizeArchitectResult(strictPlan, prompt) });
      }
    }
    if (CONNECTION_FIX_REGEX.test(String(prompt || ""))) {
      const reconnectPlan = buildReconnectPlan(safeNodes, safeEdges);
      if (reconnectPlan) {
        return res.json({ status: 'success', ...normalizeArchitectResult(reconnectPlan, prompt) });
      }
    }

    if (TOGGLE_ACTIVE_REGEX.test(promptLower) || TOGGLE_RESUME_REGEX.test(promptLower)) {
      const isPause = TOGGLE_ACTIVE_REGEX.test(promptLower);
      return res.json({
        status: 'success',
        message: isPause ? "Protocol received. I am pausing the workflow automation triggers." : "Protocol received. I am activating the workflow for live execution.",
        actions: [{ type: 'TOGGLE_ACTIVE', isActive: !isPause }],
        needsClarification: false,
        assumptions: ["Applying active/paused state based on your direct instruction."]
      });
    }

    const promptDetectedApps = getDetectedAppsFromText(prompt || "");
    const historyDetectedApps = getDetectedAppsFromText(historyText || "");
    const contextDetectedApps = mergeDetectedApps(promptDetectedApps, historyDetectedApps);
    const referencesPriorApps = CONTEXT_REFERENCE_REGEX.test(promptLower);
    const explicitBuildIntent =
      ACTION_INTENT_REGEX.test(promptLower) ||
      DECISION_TAKEOVER_REGEX.test(promptLower) ||
      /\b(test|example|sample|suitable)\b/.test(promptLower);
    if (contextDetectedApps.length >= 2 && (explicitBuildIntent || referencesPriorApps)) {
      const deterministicPlan = matchTemplate(prompt, nextIdNum, historyText);
      if (deterministicPlan) {
        const reconciled = reconcilePlanWithExistingWorkflow(deterministicPlan, safeNodes, safeEdges);
        return res.json({ status: "success", ...normalizeArchitectResult(reconciled, prompt) });
      }
    }

    // First try AI
    const systemPrompt = `You are the ORVEXIA AI ARCHITECT. You design automation workflows like Zapier.

CURRENT WORKFLOW STATE:
- Existing nodes: ${JSON.stringify(safeNodes.map(n => ({ id: n.id, label: n.data?.label })))}
- Existing edges: ${JSON.stringify(safeEdges.map(e => ({ source: e.source, target: e.target })))}
- Next available ID number: ${nextIdNum}
- Conversation history (latest first relevance): ${historyText || "No previous context."}

USER REQUEST: "${prompt}"

AVAILABLE NODE TYPES (use EXACT names):
Apps: "Gmail", "Slack", "GitHub", "Notion", "Google Drive", "Google Keep", "Discord", "Google Docs", "Google Meet", "Facebook", "Instagram", "Stripe", "HubSpot", "Typeform", "Calendly"
Actions: "HTTP Request", "Flow Module", "Database Query"
Triggers: "Start", "Webhook", "Output"
AI: "AI Agent", "Create with AI", "AI Request"
Logic: "Condition", "Filter", "Path", "Formatter", "Evaluate", "Delay"
Looping: "For Each", "While"

RULES:
1. Generate node IDs sequentially starting from node_${nextIdNum}
2. ALWAYS include CONNECT_NODES actions
3. For app integrations, include "requiresAuth": true
4. If user intent is ambiguous, return clarification mode:
{"message":"...","needsClarification":true,"followUpQuestions":["...","..."],"actions":[]}
5. Keep message concise
6. If user says "you decide/as needed", proceed with best default assumptions and include them in "assumptions" array.
7. NEVER duplicate existing app nodes unless user explicitly asks for another instance (example: Slack trigger + Slack action).
8. Prefer reusing existing node IDs from current workflow; only add missing nodes.
9. If the user mentions "all of them", "test all", or multiple apps, you MUST generate a complete chain connecting them logically (e.g. Gmail -> AI -> Notion -> Slack).
10. If the canvas is currently empty or nodes are missing, re-build the requested automation from scratch.

RESPOND WITH ONLY JSON (no markdown). You MUST output as many ADD_NODE and CONNECT_NODES actions as necessary to fulfill the user's entire multi-app request (e.g. if they ask for Slack, Gmail, and Notion, output 3 ADD_NODE actions and connect them):
{"message":"...","planStages":[{"stage":"TRIGGER","title":"...","summary":"..."}],"needsClarification":false,"followUpQuestions":[],"assumptions":[],"actions":[{"type":"ADD_NODE","nodeType":"Gmail","nodeId":"node_${nextIdNum}","role":"trigger","config":{},"requiresAuth":true,"authType":"oauth2"},{"type":"ADD_NODE","nodeType":"Slack","nodeId":"node_999","role":"action","config":{},"requiresAuth":true,"authType":"oauth2"},{"type":"CONNECT_NODES","source":"node_${nextIdNum}","target":"node_999"}]}`;

    const aiResponse = await AIService.generate(systemPrompt);
    
    // Check if AI succeeded
    if (aiResponse && !aiResponse.startsWith('AI_ERROR') && !aiResponse.startsWith('AI_UNAVAILABLE')) {
      let result;
      try {
        let jsonStr = aiResponse;
        const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim();
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
          console.log('[AIController] AI response parsed successfully');
          const reconciled = reconcilePlanWithExistingWorkflow(result, safeNodes, safeEdges);
          return res.json({ status: 'success', ...normalizeArchitectResult(reconciled, prompt) });
        }
      } catch (e) {
        console.error("[AIController] AI response parse failed, falling back to templates");
      }
    }

    // Fallback: Use local smart templates
    console.log('[AIController] Using local template engine (AI unavailable)');
    const templateResult = matchTemplate(prompt, nextIdNum, historyText);
    
    if (templateResult) {
      const reconciled = reconcilePlanWithExistingWorkflow(templateResult, safeNodes, safeEdges);
      return res.json({ status: 'success', ...normalizeArchitectResult(reconciled, prompt) });
    }

    // Final fallback: generic response
    return res.json({ status: 'success', ...buildClarificationResponse(prompt, []) });

  } catch (error) {
    console.error("[AIController] Error:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const ownerId = req.user.id;

    const isOwner = await verifyWorkflowOwnership(workflowId, ownerId);
    if (!isOwner) {
      return res.status(403).json({ status: "error", message: "You do not own this workflow" });
    }

    const conversation = await CopilotConversation.findOne({
      owner_id: ownerId,
      workflow_id: workflowId,
    }).select("messages updatedAt");

    return res.json({
      status: "success",
      messages: conversation?.messages || [],
      updatedAt: conversation?.updatedAt || null,
    });
  } catch (error) {
    console.error("[AIController] getConversation error:", error.message);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

exports.saveConversation = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const ownerId = req.user.id;
    const sanitizedMessages = sanitizeConversationMessages(req.body?.messages || []);

    const isOwner = await verifyWorkflowOwnership(workflowId, ownerId);
    if (!isOwner) {
      return res.status(403).json({ status: "error", message: "You do not own this workflow" });
    }

    const conversation = await CopilotConversation.findOneAndUpdate(
      { owner_id: ownerId, workflow_id: workflowId },
      { $set: { messages: sanitizedMessages } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({
      status: "success",
      messages: conversation.messages || [],
      updatedAt: conversation.updatedAt || null,
    });
  } catch (error) {
    console.error("[AIController] saveConversation error:", error.message);
    return res.status(500).json({ status: "error", message: error.message });
  }
};
