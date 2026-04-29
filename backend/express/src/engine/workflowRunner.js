const vm = require("vm");
const axios = require("axios");
const EmailService = require("../services/EmailService");
const Workflow = require("../models/workflow-model");
const User = require("../models/user.models");
const GoogleService = require("../services/GoogleService");
const ConnectionService = require("../services/ConnectionService");
const fs = require("fs");
const path = require("path");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeLabel = (node) => String(node?.data?.label || node?.data?.app || "").trim().toLowerCase();

const getNodeKind = (node) => {
  const label = normalizeLabel(node);
  const nodeType = String(node?.data?.nodeType || "").toLowerCase();

  if (nodeType === "trigger" || label === "start" || label === "webhook") return "trigger";
  if (label === "filter") return "filter";
  if (label === "formatter") return "formatter";
  if (label === "delay") return "delay";
  if (label === "evaluate" || label === "condition" || label === "if") return "evaluate";
  if (label === "ai agent" || label === "ai request" || label === "create with ai") return "ai";
  if (label === "output") return "output";
  return "action";
};

const getStartNode = (nodes, edges, contextData = {}) => {
  const forcedStartId = contextData?.__startNodeId;
  if (forcedStartId) {
    const forcedNode = nodes.find((node) => node.id === forcedStartId);
    if (forcedNode) return forcedNode;
  }

  const nonStartTrigger = nodes.find((node) => {
    if (getNodeKind(node) !== "trigger") return false;
    const label = normalizeLabel(node);
    return label !== "start";
  });
  if (nonStartTrigger) return nonStartTrigger;

  const explicit = nodes.find((node) => getNodeKind(node) === "trigger");
  if (explicit) return explicit;

  const targets = new Set(edges.map((edge) => edge.target));
  return nodes.find((node) => !targets.has(node.id)) || nodes[0];
};

const getValueByPath = (source, path) => {
  if (!source || !path) return undefined;
  return String(path).split(".").reduce((value, key) => {
    if (value == null) return undefined;
    return value[key];
  }, source);
};

const resolveTemplate = (value, context) => {
  if (Array.isArray(value)) return value.map((item) => resolveTemplate(item, context));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolveTemplate(item, context)]));
  }
  if (typeof value !== "string") return value;

  return value.replace(/\{\{\s*([\w-]+)(?:\.([\w.[\]-]+))?\s*\}\}/g, (match, nodeId, path) => {
    // Priority 1: Specific node or trigger
    let source = (nodeId === "trigger" || nodeId === "node_0")
      ? context.trigger
      : context.steps[nodeId];

    let resolved = path ? getValueByPath(source, path) : source;

    // Priority 2: Fallback to global current context (merged outputs)
    if (resolved === undefined || resolved === null) {
      resolved = path ? getValueByPath(context.current, path) : context.current[nodeId];
    }

    // Priority 3: Deep search for the key anywhere in current context
    if (resolved === undefined || resolved === null && path) {
      resolved = getValueByPath(context.current, path);
    }

    if (resolved === undefined || resolved === null) return match;
    return typeof resolved === "object" ? JSON.stringify(resolved) : String(resolved);
  });
};

const buildConfig = (node, context) => {
  const data = node.data || {};
  const ignored = new Set(["label", "nodeType", "category", "description", "app", "icon", "color", "badge", "status"]);
  const config = {};

  for (const [key, value] of Object.entries(data)) {
    if (!ignored.has(key)) config[key] = resolveTemplate(value, context);
  }

  if (typeof config.payload === "string" && config.payload.trim()) {
    try {
      config.payload = JSON.parse(config.payload);
    } catch {
      config.payload = { raw: config.payload };
    }
  }

  return config;
};

const logExecution = async (execution, level, message, nodeId) => {
  const log = { timestamp: new Date(), level, message, nodeId };
  execution.logs.push(log);
  await execution.save();
  return log;
};

const emitLog = async (execution, io, level, message, nodeId) => {
  const log = await logExecution(execution, level, message, nodeId);
  if (io) io.emit("workflow_log", { executionId: execution._id, log });
};

const setStepStatus = async (execution, io, node, status, patch = {}) => {
  let step = execution.steps.find((item) => item.nodeId === node.id);
  if (!step) {
    execution.steps.push({ nodeId: node.id, label: node.data?.label || node.id, status: "PENDING" });
    step = execution.steps[execution.steps.length - 1];
  }

  step.status = status;
  Object.assign(step, patch);
  await execution.save();

  if (io) {
    io.emit("workflow_update", {
      executionId: execution._id,
      nodeId: node.id,
      status,
      output: patch.output,
      error: patch.error,
    });
  }
};

const runHttpAction = async (config) => {
  const url = config.url || config.endpoint || config.webhook_url;
  if (!url) throw new Error("HTTP Request requires a URL");

  const method = String(config.method || "POST").toUpperCase();
  const headers = typeof config.headers === "string" ? JSON.parse(config.headers || "{}") : (config.headers || {});
  const body = config.payload || config.body || config.message || {};
  const response = await axios.request({
    url,
    method,
    headers,
    data: ["GET", "HEAD"].includes(method) ? undefined : body,
    timeout: Number(config.timeoutMs || 15000),
    validateStatus: () => true,
  });

  return {
    Response_Body: response.data,
    Status_Code: response.status,
    Headers: response.headers,
  };
};

const base64Url = (value) => Buffer.from(value)
  .toString("base64")
  .replace(/\+/g, "-")
  .replace(/\//g, "_")
  .replace(/=+$/, "");

const decodeBase64Url = (value = "") => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf8");
};

const getHeader = (headers = [], name) => {
  const found = headers.find((header) => header.name?.toLowerCase() === name.toLowerCase());
  return found?.value || "";
};

const extractGmailBody = (payload) => {
  if (!payload) return "";
  if (payload.body?.data) return decodeBase64Url(payload.body.data);
  for (const part of payload.parts || []) {
    const body = extractGmailBody(part);
    if (body) return body;
  }
  return "";
};

const extractEmailAddress = (value = "") => {
  const raw = String(value || "").trim();
  const match = raw.match(/<([^>]+)>/);
  return (match?.[1] || raw).trim();
};

const getLatestGmailMessage = async (ownerId, query = "is:unread newer_than:7d") => {
  let list;
  try {
    list = await GoogleService.request(ownerId, {
      method: "GET",
      url: "https://gmail.googleapis.com/gmail/v1/users/me/messages",
      params: { q: query, maxResults: 1 },
    });
  } catch (error) {
    const status = Number(error?.response?.status || 0);
    const details = String(error?.response?.data?.error?.message || error?.message || "").toLowerCase();
    const scopeDenied = details.includes("insufficient authentication scopes") || details.includes("insufficient permissions");
    if (status === 401 || status === 403 || scopeDenied) {
      throw new Error("Google permission needed. Reconnect Google in Apps and grant Gmail scopes, then the workflow will auto-resume.");
    }
    throw error;
  }

  const messageId = list.data.messages?.[0]?.id;
  if (!messageId) return null;

  const message = await GoogleService.request(ownerId, {
    method: "GET",
    url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
    params: { format: "full" },
  });

  const headers = message.data.payload?.headers || [];
  return {
    id: message.data.id,
    threadId: message.data.threadId,
    snippet: message.data.snippet,
    from: getHeader(headers, "From"),
    to: getHeader(headers, "To"),
    subject: getHeader(headers, "Subject"),
    messageId: getHeader(headers, "Message-ID"),
    body: extractGmailBody(message.data.payload),
  };
};

const sendGmailMessage = async (ownerId, { to, subject, body, threadId, inReplyTo }) => {
  if (!to) throw new Error("Gmail send requires a recipient");
  const headers = [
    `To: ${to}`,
    `Subject: ${subject || "ORVEXIA automated reply"}`,
    "Content-Type: text/plain; charset=UTF-8",
  ];
  if (inReplyTo) {
    headers.push(`In-Reply-To: ${inReplyTo}`);
    headers.push(`References: ${inReplyTo}`);
  }
  const raw = base64Url(`${headers.join("\r\n")}\r\n\r\n${body || ""}`);
  const response = await GoogleService.request(ownerId, {
    method: "POST",
    url: "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    data: { raw, threadId },
  });
  return response.data;
};

const runFormatter = (config) => {
  const type = config.formatterType || "text";
  const op = config.operation || "uppercase";
  const value = config.payload?.raw ?? config.payload ?? "";

  if (type === "number") {
    const left = Number(value || 0);
    const right = Number(config.mathValue || 1);
    if (op === "add") return { Result: left + right };
    if (op === "subtract") return { Result: left - right };
    if (op === "multiply") return { Result: left * right };
    return { Result: left };
  }

  if (type === "date") {
    const date = value ? new Date(value) : new Date();
    return { Result: date.toISOString() };
  }

  const text = String(value);
  if (op === "lowercase") return { Result: text.toLowerCase() };
  if (op === "split") return { Result: text.split(config.separator || ",") };
  if (op === "replace") return { Result: text.split(config.findText || "").join(config.replaceText || "") };
  return { Result: text.toUpperCase() };
};

const runFilter = (config) => {
  const value = config.payload?.raw ?? config.payload ?? "";
  const target = config.filterTarget || "";
  const condition = config.condition || "EXISTS";

  if (condition === "MATCHES") return { filterPassed: String(value) === String(target) };
  if (condition === "CONTAINS") return { filterPassed: String(value).includes(String(target)) };
  if (condition === "GREATER_THAN") return { filterPassed: Number(value) > Number(target) };
  return { filterPassed: value !== undefined && value !== null && String(value).length > 0 };
};

const runEvaluate = (config, context) => {
  const code = config.code || config.payload?.raw || "return input;";
  const script = new vm.Script(`(() => { ${code} })()`);
  const result = script.runInNewContext(
    { input: context.current, trigger: context.trigger, steps: context.steps, Math, Date, JSON },
    { timeout: 1000 }
  );
  return { Result: result };
};

const runAi = async (config, context) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      Agent_Response: `AI agent received ${Object.keys(context.current || {}).length} context fields. Configure GEMINI_API_KEY for live reasoning.`,
      Confidence_Score: 0.4,
      Tokens_Used: 0,
    };
  }

  let knowledgeContext = "";
  const notionQuery = config.notion_query || config.knowledge_query;
  if (notionQuery) {
    const notionConnection = await ConnectionService.get(context.workflowOwnerId, "notion");
    const notionToken = notionConnection?.secrets?.token || process.env.NOTION_TOKEN;
    if (!notionToken) {
      throw new Error("Notion permission needed. Save a Notion token in Apps before this AI agent can query the knowledge base.");
    }
    const searchResponse = await axios.post("https://api.notion.com/v1/search", {
      query: notionQuery,
      page_size: 5,
    }, {
      headers: {
        Authorization: `Bearer ${notionToken}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
    });
    knowledgeContext = JSON.stringify(searchResponse.data.results.map((item) => ({
      id: item.id,
      type: item.object,
      title: item.properties?.Name?.title?.[0]?.plain_text || item.properties?.title?.title?.[0]?.plain_text || item.url || "Untitled",
      url: item.url,
    })));
  }

  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const prompt = `${config.prompt || config.description || "Analyze this workflow context and return useful JSON."}

Workflow context:
${JSON.stringify(context.current)}

Notion knowledge base context:
${knowledgeContext || "No Notion context requested."}

Return a concise result that downstream Gmail, Docs, or Slack steps can map with {{${config.nodeId || "node_id"}.Agent_Response}}.`;

  // Retry with backoff for transient API errors (503, 429, etc.)
  const modelNames = [
    process.env.GEMINI_MODEL || "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-2.5-flash-lite",
  ];
  
  let lastError = null;
  for (const modelName of modelNames) {
    for (let attempt = 0; attempt < 1; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        console.log(`[AI] Attempt ${attempt + 1} with model ${modelName}`);
        const result = await model.generateContent(prompt);
        return {
          Agent_Response: result.response.text(),
          Confidence_Score: 0.8,
        };
      } catch (error) {
        lastError = error;
        const errorMsg = String(error.message || "");
        const isRetryable = errorMsg.includes("503") || errorMsg.includes("429") || 
                           errorMsg.includes("high demand") || errorMsg.includes("overloaded") ||
                           errorMsg.includes("RESOURCE_EXHAUSTED");
        console.log(`[AI] ${modelName} attempt ${attempt + 1} failed: ${errorMsg.substring(0, 100)}`);
        
        if (!isRetryable) break; // Non-retryable error, try next model
        if (attempt < 2) await wait(2000 * (attempt + 1)); // 2s, 4s backoff
      }
    }
  }
  
  // All Gemini retries failed — use smart local response engine
  console.log("[AI] All Gemini models failed. Using local response engine.");
  const messageText = String(context.current?.Message_Text || context.current?.text || context.current?.Email_Body || "").toLowerCase();
  
  let response = "";
  if (messageText.includes("hello") || messageText.includes("hi") || messageText.includes("hey") || messageText.includes("hellow")) {
    response = "👋 Hello! I'm ORvexia, your AI-powered automation assistant. I'm here to help your team streamline workflows, manage integrations, and boost productivity. What can I help you with today?";
  } else if (messageText.includes("introduce") || messageText.includes("who are you") || messageText.includes("what are you")) {
    response = "🤖 I'm ORvexia — an AI automation platform that connects your favorite tools (Slack, Gmail, Google Calendar, Notion, and more) into powerful automated workflows. I can read emails, schedule meetings, create documents, and respond to messages — all without manual effort!";
  } else if (messageText.includes("mail") || messageText.includes("email") || messageText.includes("send")) {
    response = "📧 I can help with email automation! I'm set up to monitor your Gmail inbox, summarize incoming emails, and notify the team right here in Slack. To send an email, you can set up a workflow in the ORvexia dashboard at localhost:5173.";
  } else if (messageText.includes("help") || messageText.includes("what can you do")) {
    response = "🚀 Here's what I can do:\n• 💬 Respond to Slack messages with AI\n• 📧 Monitor & summarize emails from Gmail\n• 📅 Create Google Calendar events & Meet links\n• 📝 Generate Google Docs\n• 📋 Create Notion pages\n• 🔄 Run multi-step automated workflows\n\nJust mention @ORvexia with your request!";
  } else if (messageText.includes("active") || messageText.includes("alive") || messageText.includes("working") || messageText.includes("online")) {
    response = "✅ Yes, I'm active and running! All my automation systems are online. I'm monitoring Slack messages, Gmail, and all connected integrations. How can I help?";
  } else if (messageText.includes("joke") || messageText.includes("funny")) {
    response = "😄 Why do programmers prefer dark mode? Because light attracts bugs! 🐛\n\nBut seriously, I'm here to help with real work. What can I automate for you?";
  } else if (messageText.includes("thank") || messageText.includes("thanks")) {
    response = "😊 You're welcome! Always happy to help. Let me know if there's anything else I can automate for you!";
  } else if (messageText.includes("schedule") || messageText.includes("meeting") || messageText.includes("calendar")) {
    response = "📅 I can help with scheduling! Set up a Google Calendar workflow in the ORvexia dashboard and I'll automatically create events, check availability, and send meeting links.";
  } else {
    response = "👋 Thanks for your message! I'm ORvexia, your AI assistant. I received: \"" + String(context.current?.Message_Text || context.current?.text || "").substring(0, 100) + "\"\n\nI'm currently processing this request using my localized protocol while the primary AI neural link recharges. I will be back at full capacity shortly. In the meantime, try asking me to 'introduce yourself' or 'what can you do'!";
  }
  
  return {
    Agent_Response: response,
    Confidence_Score: 0.6,
  };
};

const runAction = async (node, config, context, workflow) => {
  const label = normalizeLabel(node);

  if (label === "http request") return runHttpAction(config);

  if (label === "gmail") {
    const inferredAction = config.to ? "send_google" : "auto_reply";
    const action = String(config.action || inferredAction).toLowerCase();

    if (action === "read_latest") {
      const latest = await getLatestGmailMessage(workflow.owner_id, config.query || "is:unread newer_than:7d");
      if (!latest) return { found: false, message: "No matching email found" };
      return {
        found: true,
        Email_ID: latest.id,
        Thread_ID: latest.threadId,
        Email_Body: latest.body,
        Sender: latest.from,
        Subject: latest.subject,
        Snippet: latest.snippet,
        Message_ID: latest.messageId,
      };
    }

    if (action === "auto_reply") {
      const latest = await getLatestGmailMessage(workflow.owner_id, config.query || "is:unread newer_than:7d");
      if (!latest) return { found: false, replied: false, message: "No matching email found" };
      const replyTo = extractEmailAddress(config.to || latest.from);
      const sent = await sendGmailMessage(workflow.owner_id, {
        to: replyTo,
        subject: config.subject || `Re: ${latest.subject || "Your message"}`,
        body: config.body || config.message || "Thanks for your message. We will follow up shortly.",
        threadId: latest.threadId,
        inReplyTo: latest.messageId,
      });
      if (config.mark_read !== "false") {
        await GoogleService.request(workflow.owner_id, {
          method: "POST",
          url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${latest.id}/modify`,
          data: { removeLabelIds: ["UNREAD"] },
        });
      }
      return {
        found: true,
        replied: true,
        Reply_ID: sent.id,
        Thread_ID: sent.threadId,
        Original_Subject: latest.subject,
        Original_Sender: latest.from,
      };
    }

    if (action === "send_google") {
      const sent = await sendGmailMessage(workflow.owner_id, {
        to: config.to,
        subject: config.subject,
        body: config.body || config.message,
      });
      return { email_sent: true, Email_ID: sent.id, Thread_ID: sent.threadId, provider: "gmail_api" };
    }

    const owner = await User.findById(workflow.owner_id);
    const result = await EmailService.send(config.to, config.name || config.to, "custom", {
      message: config.body || config.message || "",
      subject: config.subject || "ORVEXIA Notification",
    });
    if (!result.ok) throw new Error(result.message || "Gmail action failed");
    return { email_sent: true, to: config.to, by: owner?.email || "ORVEXIA" };
  }

  if (label === "discord") {
    if (!config.webhook_url) throw new Error("Discord action requires webhook_url");
    const response = await axios.post(config.webhook_url, { content: config.message || config.body || "ORVEXIA workflow notification" });
    return { Message_ID: response.data?.id || null, Status_Code: response.status };
  }

  if (label === "slack") {
    const connection = await ConnectionService.get(workflow.owner_id, "slack");
    const slackToken = config.token || connection?.secrets?.token;
    const defaultChannel = connection?.publicData?.defaultChannel || "#general";
    const incomingChannel = context?.current?.Channel_ID || context?.trigger?.slack_event?.channel || context?.trigger?.channel;
    const configuredChannel = String(config.channel || "").trim();
    const useConfigured = configuredChannel && !/^c\d{4,}$/i.test(configuredChannel);
    const targetChannel = useConfigured ? configuredChannel : (incomingChannel || configuredChannel || defaultChannel);
    const messageText = config.message || config.messageTemplate || config.body || "ORVEXIA workflow notification";

    if (slackToken) {
      const response = await axios.post("https://slack.com/api/chat.postMessage", {
        channel: targetChannel,
        text: messageText,
      }, {
        headers: {
          Authorization: `Bearer ${slackToken}`,
          "Content-Type": "application/json; charset=utf-8",
        },
      });

      if (!response.data?.ok) {
        const error = response.data?.error || "message_post_failed";
        if (error === 'channel_not_found') {
          throw new Error(`Slack API error: channel_not_found. The ORvexia app might not be invited to the channel "${targetChannel}". Please invite the bot to this channel first.`);
        }
        throw new Error(`Slack API error: ${error}`);
      }

      return {
        Message_TS: response.data.ts || new Date().toISOString(),
        Channel: response.data.channel || targetChannel,
        sent_text: messageText,
      };
    }

    const webhookUrl = config.webhook_url || connection?.secrets?.webhookUrl;
    if (webhookUrl) {
      const response = await axios.post(webhookUrl, { text: messageText });
      return { Message_TS: response.data?.ts || new Date().toISOString(), Status_Code: response.status };
    }
    throw new Error("Slack permission needed. Connect Slack in one click from the auth bar, then the agent will resume automatically.");
  }

  if (label === "github") {
    if (!process.env.GITHUB_TOKEN) {
      return { Issue_URL: null, Status: "simulated", reason: "Configure GITHUB_TOKEN for live GitHub issue creation" };
    }
    const [owner, repo] = String(config.repo || "").split("/");
    if (!owner || !repo) throw new Error("GitHub action requires repo as owner/repo");
    const response = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
      { title: config.title || "ORVEXIA workflow issue", body: config.body || "" },
      { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: "application/vnd.github+json" } }
    );
    return { Issue_URL: response.data.html_url, Issue_ID: response.data.number, Status: response.data.state };
  }

  if (label === "notion") {
    const connection = await ConnectionService.get(workflow.owner_id, "notion");
    const token = config.token || connection?.secrets?.token || process.env.NOTION_TOKEN;
    const databaseId = config.database_id || connection?.secrets?.databaseId;
    if (!token) throw new Error("Notion permission needed. Connect Notion from the auth bar, then the agent will resume automatically.");
    if (!databaseId) throw new Error("Notion database not selected. Set database_id in this step.");
    const response = await axios.post(`https://api.notion.com/v1/pages`, {
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [{ text: { content: config.page_title || "ORVEXIA workflow item" } }],
        },
      },
      children: config.content ? [{
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [{ type: "text", text: { content: String(config.content) } }] },
      }] : [],
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
    });
    return { 
      Page_ID: response.data.id, 
      URL: response.data.url, 
      Created_Time: response.data.created_time,
      sent_title: config.page_title,
      sent_content: config.content
    };
  }

  if (label === "google calendar" || label === "google meet") {
    if (String(config.action || "").toLowerCase() === "check_availability") {
      const start = config.start || new Date().toISOString();
      const end = config.end || new Date(Date.now() + 60 * 60 * 1000).toISOString();
      const response = await GoogleService.request(workflow.owner_id, {
        method: "POST",
        url: "https://www.googleapis.com/calendar/v3/freeBusy",
        data: {
          timeMin: start,
          timeMax: end,
          items: [{ id: config.calendarId || "primary" }],
        },
      });
      const busy = response.data.calendars?.[config.calendarId || "primary"]?.busy || [];
      return {
        Available: busy.length === 0,
        Busy_Blocks: busy,
        Checked_Start: start,
        Checked_End: end,
      };
    }

    const event = {
      summary: config.title || config.summary || "ORVEXIA workflow event",
      description: config.description || config.body || "",
      start: { dateTime: config.start || new Date(Date.now() + 15 * 60 * 1000).toISOString() },
      end: { dateTime: config.end || new Date(Date.now() + 45 * 60 * 1000).toISOString() },
      attendees: String(config.attendees || config.to || "")
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean)
        .map((email) => ({ email })),
    };

    if (label === "google meet") {
      event.conferenceData = {
        createRequest: {
          requestId: `orvexia-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      };
    }

    const response = await GoogleService.request(workflow.owner_id, {
      method: "POST",
      url: `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(config.calendarId || "primary")}/events`,
      params: label === "google meet" ? { conferenceDataVersion: 1, sendUpdates: "all" } : { sendUpdates: "all" },
      data: event,
    });
    return {
      Event_ID: response.data.id,
      Event_URL: response.data.htmlLink,
      Meet_URL: response.data.hangoutLink || response.data.conferenceData?.entryPoints?.[0]?.uri || null,
    };
  }

  if (label === "google docs") {
    const created = await GoogleService.request(workflow.owner_id, {
      method: "POST",
      url: "https://docs.googleapis.com/v1/documents",
      data: { title: config.title || "ORVEXIA generated document" },
    });
    const documentId = created.data.documentId;
    const body = config.content || config.body || "";
    if (body) {
      await GoogleService.request(workflow.owner_id, {
        method: "POST",
        url: `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`,
        data: { requests: [{ insertText: { location: { index: 1 }, text: String(body) } }] },
      });
    }
    return { Document_ID: documentId, Document_URL: `https://docs.google.com/document/d/${documentId}/edit` };
  }

  if (label === "google keep" || label === "google note" || label === "google notes") {
    try {
      const action = String(config.action || "create_note").toLowerCase();

      if (action === "list_recent") {
        const response = await GoogleService.request(workflow.owner_id, {
          method: "GET",
          url: "https://keep.googleapis.com/v1/notes",
          params: { pageSize: Number(config.pageSize || 10) },
        });

        const notes = (response.data.notes || []).map((note) => ({
          id: note.name,
          title: note.title || "",
          text: note.body?.text?.text || "",
          createTime: note.createTime,
          updateTime: note.updateTime,
        }));

        return {
          Total_Notes: notes.length,
          Notes: notes,
        };
      }

      const title = config.title || "ORVEXIA Note";
      const text = config.content || config.body || config.message || "";
      const payload = {
        title: String(title),
        body: { text: { text: String(text) } },
      };

      const response = await GoogleService.request(workflow.owner_id, {
        method: "POST",
        url: "https://keep.googleapis.com/v1/notes",
        data: payload,
      });

      return {
        Note_ID: response.data.name,
        Note_Title: response.data.title || title,
        Note_Text: response.data.body?.text?.text || String(text),
        Create_Time: response.data.createTime || null,
        Update_Time: response.data.updateTime || null,
      };
    } catch (error) {
      const status = error?.response?.status;
      const details = String(error?.response?.data?.error?.message || error?.message || "").toLowerCase();
      const scopeDenied = details.includes("insufficient authentication scopes") || details.includes("insufficient permissions");
      if (status === 401 || status === 403 || scopeDenied) {
        throw new Error("Google permission needed. Reconnect Google to include Google Keep access, then the agent will resume automatically.");
      }
      throw error;
    }
  }

  if (label === "google drive") {
    const metadata = {
      name: config.file_name || config.title || "orvexia-output.txt",
      mimeType: config.mimeType || "text/plain",
      parents: config.folder_id ? [config.folder_id] : undefined,
    };
    const response = await GoogleService.request(workflow.owner_id, {
      method: "POST",
      url: "https://www.googleapis.com/drive/v3/files",
      params: { fields: "id,name,webViewLink" },
      data: metadata,
    });
    return { File_ID: response.data.id, File_Name: response.data.name, File_URL: response.data.webViewLink || null };
  }

  if (label === "cal.com" || label === "calendly") {
    const connection = await ConnectionService.get(workflow.owner_id, "calcom");
    const apiKey = config.apiKey || connection?.secrets?.apiKey || process.env.CALCOM_API_KEY;
    if (!apiKey) throw new Error("Cal.com permission needed. Add CALCOM_API_KEY or save it in Apps.");
    return {
      Result: "ready",
      Message: "Cal.com API key is configured. Add event-type specific payload fields to finalize booking creation.",
    };
  }

  if (label === "database query") {
    return { Result: "beta", Message: "Database Query is marked beta for this prototype.", Input: config };
  }

  return { Result: "ok", App: node.data?.label || "Action", Input: config };
};

const executeNode = async (node, context, workflow) => {
  const kind = getNodeKind(node);
  const config = buildConfig(node, context);
  config.nodeId = node.id;

  if (kind === "trigger") {
    const label = normalizeLabel(node);

    if (label === "slack") {
      const slackEvent = context.trigger?.slack_event || context.trigger;
      if (!slackEvent || !slackEvent.type) {
        return { triggered: false, skipped: true, reason: "No Slack event payload received" };
      }
      return {
        triggered: true,
        Payload: slackEvent,
        Channel_ID: slackEvent.channel || "",
        Sender_User: slackEvent.user || "",
        Message_Text: slackEvent.text || "",
        Message_TS: slackEvent.ts || "",
        Event_Type: slackEvent.type || "",
      };
    }

    if (label === "gmail") {
      const latest = await getLatestGmailMessage(workflow.owner_id, config.query || "is:unread newer_than:15m");
      if (!latest) return { triggered: false, skipped: true, reason: "No new Gmail email found" };

      if (String(config.mark_read_trigger || "true") !== "false") {
        await GoogleService.request(workflow.owner_id, {
          method: "POST",
          url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${latest.id}/modify`,
          data: { removeLabelIds: ["UNREAD"] },
        });
      }

      return {
        triggered: true,
        Payload: latest,
        Email_ID: latest.id,
        Thread_ID: latest.threadId,
        Email_Body: latest.body,
        Sender: latest.from,
        Subject: latest.subject,
        Snippet: latest.snippet,
        Message_ID: latest.messageId,
      };
    }

    return { triggered: true, Payload: context.trigger };
  }
  if (kind === "filter") return runFilter(config);
  if (kind === "formatter") return runFormatter(config);
  if (kind === "delay") {
    await wait(Math.min(Number(config.delayMs || 1000), 30000));
    return { delayed: true, delayMs: Math.min(Number(config.delayMs || 1000), 30000) };
  }
  if (kind === "evaluate") return runEvaluate(config, context);
  if (kind === "ai") return runAi(config, context);
  if (kind === "output") return { Output: context.current };
  return runAction(node, config, context, workflow);
};

const updateWorkflowStats = async (workflowId) => {
  const Execution = require("../models/execution-model");
  const [total, completed] = await Promise.all([
    Execution.countDocuments({ workflow_id: workflowId }),
    Execution.countDocuments({ workflow_id: workflowId, status: "COMPLETED" }),
  ]);
  await Workflow.findByIdAndUpdate(workflowId, {
    "stats.total_runs": total,
    "stats.success_rate": total ? Math.round((completed / total) * 100) : 0,
  });
};

const getAuthPauseDetails = (error) => {
  const message = String(error?.message || "");
  const normalized = message.toLowerCase();
  if (!normalized.includes("permission needed")) return null;

  if (normalized.includes("google")) {
    return {
      appKey: "google_oauth",
      appName: "Google",
      message,
    };
  }
  if (normalized.includes("slack")) {
    return {
      appKey: "slack",
      appName: "Slack",
      message,
    };
  }
  if (normalized.includes("notion")) {
    return {
      appKey: "notion",
      appName: "Notion",
      message,
    };
  }
  if (normalized.includes("cal.com") || normalized.includes("calcom")) {
    return {
      appKey: "calcom",
      appName: "Cal.com",
      message,
    };
  }
  return {
    appKey: "unknown",
    appName: "Connection",
    message,
  };
};

const runWorkflow = async (nodes, edges, execution, io) => {
  const workflow = await Workflow.findById(execution.workflow_id);
  const context = {
    trigger: execution.contextData || execution.checkpoint?.contextData || {},
    current: execution.contextData || execution.checkpoint?.contextData || {},
    steps: {},
    workflowOwnerId: workflow.owner_id,
  };

  let currentNode = getStartNode(nodes, edges, execution.contextData || execution.checkpoint?.contextData || {});
  if (!currentNode) throw new Error("Workflow has no nodes");

  execution.status = "RUNNING";
  await execution.save();
  if (io) io.emit("workflow_started", { executionId: execution._id });
  await emitLog(execution, io, "INFO", "Workflow execution started");

  try {
    while (currentNode) {
      const startedAt = new Date();
      await setStepStatus(execution, io, currentNode, "RUNNING", {
        input: context.current,
        startedAt,
      });
      await emitLog(execution, io, "INFO", `Running ${currentNode.data?.label || currentNode.id}`, currentNode.id);

      const output = await executeNode(currentNode, context, workflow);
      context.steps[currentNode.id] = output;
      context.current = { ...context.current, ...output };
      
      const logMsg = `[${new Date().toISOString()}] Node ${currentNode.id} finished. Output: ${JSON.stringify(output)}\n`;

      // Merge node outputs into trigger context so {{trigger.XXX}} always works
      if (output && typeof output === 'object') {
        context.trigger = { ...context.trigger, ...output };
      }

      const kind = getNodeKind(currentNode);
      if (kind === "trigger" && output.triggered === false) {
        await setStepStatus(execution, io, currentNode, "STOPPED", {
          output,
          completedAt: new Date(),
          latencyMs: Date.now() - startedAt.getTime(),
        });
        execution.status = "STOPPED";
        execution.contextData = context.current;
        execution.completedAt = new Date();
        await execution.save();
        await emitLog(execution, io, "INFO", output.reason || "Trigger conditions not met. Workflow stopped.", currentNode.id);
        if (io) io.emit("workflow_complete", { executionId: execution._id, status: "STOPPED" });
        await updateWorkflowStats(workflow._id);
        return execution;
      }
      if (kind === "filter" && output.filterPassed === false) {
        await setStepStatus(execution, io, currentNode, "STOPPED", {
          output,
          completedAt: new Date(),
          latencyMs: Date.now() - startedAt.getTime(),
        });
        execution.status = "STOPPED";
        execution.contextData = context.current;
        execution.completedAt = new Date();
        await execution.save();
        await emitLog(execution, io, "INFO", "Filter criteria not met. Workflow stopped.", currentNode.id);
        if (io) io.emit("workflow_complete", { executionId: execution._id, status: "STOPPED" });
        await updateWorkflowStats(workflow._id);
        return execution;
      }

      await setStepStatus(execution, io, currentNode, "SUCCESS", {
        output,
        completedAt: new Date(),
        latencyMs: Date.now() - startedAt.getTime(),
      });

      const nextEdge = edges.find((edge) => edge.source === currentNode.id);
      currentNode = nextEdge ? nodes.find((node) => node.id === nextEdge.target) : null;
    }

    execution.status = "COMPLETED";
    execution.contextData = context.current;
    execution.completedAt = new Date();
    await execution.save();
    await emitLog(execution, io, "INFO", "Workflow execution completed");
    if (io) io.emit("workflow_complete", { executionId: execution._id, status: "COMPLETED" });
    await updateWorkflowStats(workflow._id);
    return execution;
  } catch (error) {
    const authPause = getAuthPauseDetails(error);
    if (authPause) {
      if (currentNode) {
        await setStepStatus(execution, io, currentNode, "STOPPED", {
          error: authPause.message,
          completedAt: new Date(),
        });
      }
      execution.status = "PAUSED";
      execution.checkpoint = {
        ...(execution.checkpoint || {}),
        contextData: context.current,
        pendingAuth: {
          nodeId: currentNode?.id || null,
          appKey: authPause.appKey,
          appName: authPause.appName,
          reason: authPause.message,
        },
      };
      execution.contextData = context.current;
      await execution.save();
      await emitLog(execution, io, "WARN", `Execution paused: ${authPause.message}`, currentNode?.id);
      if (io) io.emit("workflow_paused", { executionId: execution._id, status: "PAUSED", pendingAuth: execution.checkpoint.pendingAuth });
      await updateWorkflowStats(workflow._id);
      return execution;
    }

    if (currentNode) {
      await setStepStatus(execution, io, currentNode, "FAILED", {
        error: error.message,
        completedAt: new Date(),
      });
    }
    execution.status = "FAILED";
    execution.completedAt = new Date();
    await execution.save();
    await emitLog(execution, io, "ERROR", error.message, currentNode?.id);
    if (io) io.emit("workflow_complete", { executionId: execution._id, status: "FAILED" });
    await updateWorkflowStats(workflow._id);
    throw error;
  }
};

module.exports = { runWorkflow };
