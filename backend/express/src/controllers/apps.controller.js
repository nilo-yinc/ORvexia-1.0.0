const ConnectionService = require("../services/ConnectionService");
const User = require("../models/user.models");
const axios = require("axios");
const jwt = require("jsonwebtoken");

const apps = [
  { key: "gmail", name: "Gmail", status: "ready", credentialMode: "apps_script", category: "google" },
  { key: "google_calendar", name: "Google Calendar", status: "ready", credentialMode: "google_oauth", category: "google" },
  { key: "google_meet", name: "Google Meet", status: "ready", credentialMode: "google_oauth", category: "google" },
  { key: "google_drive", name: "Google Drive", status: "ready", credentialMode: "google_oauth", category: "google" },
  { key: "google_docs", name: "Google Docs", status: "ready", credentialMode: "google_oauth", category: "google" },
  { key: "google_keep", name: "Google Keep", status: "beta", credentialMode: "google_oauth", category: "google" },
  { key: "slack", name: "Slack", status: "ready", credentialMode: "slack_oauth", category: "communication" },
  { key: "whatsapp", name: "WhatsApp", status: "ready", credentialMode: "api_key", category: "communication" },
  { key: "github", name: "GitHub", status: "ready", credentialMode: "github_oauth", category: "productivity" },
  { key: "notion", name: "Notion", status: "ready", credentialMode: "notion_oauth", category: "productivity" },
  { key: "calcom", name: "Cal.com", status: "beta", credentialMode: "api_key", category: "calendar" },
  { key: "hubspot", name: "HubSpot", status: "beta", credentialMode: "manual", category: "crm" },
  { key: "stripe", name: "Stripe", status: "beta", credentialMode: "manual", category: "payments" },
];

const backendBaseUrl = process.env.BACKEND_PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`;
const oauthBaseUrl = process.env.OAUTH_PUBLIC_URL || backendBaseUrl;
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const slackScopes = process.env.SLACK_BOT_SCOPES || "chat:write,channels:read,groups:read";
const notionScopes = process.env.NOTION_SCOPES || "";
const githubScopes = process.env.GITHUB_APP_SCOPES || "read:user,user:email,repo";

const normalizeRedirectPath = (value, fallback = "/apps") => {
  if (!value || typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
};

exports.listApps = async (req, res) => {
  const user = await User.findById(req.user.id).select("googleId googleAccessToken email");
  const connections = await ConnectionService.list(req.user.id);
  const connectionByKey = new Map(connections.map((connection) => [connection.appKey, connection]));
  const connectedKeys = new Set(connections.map((connection) => connection.appKey));
  const hasGoogleAuth = Boolean(user?.googleId || user?.googleAccessToken);
  const googleAppKeys = new Set(["gmail", "google_calendar", "google_meet", "google_drive", "google_docs", "google_keep"]);

  const resolveConnectedAccount = (appKey) => {
    const connection = connectionByKey.get(appKey);
    if (!connection) return "";
    return (
      connection.publicData?.email ||
      connection.publicData?.username ||
      connection.publicData?.workspaceName ||
      connection.publicData?.teamName ||
      connection.publicData?.phoneNumberId ||
      ""
    );
  };

  res.json({
    data: apps.map((app) => ({
      ...app,
      connected: connectedKeys.has(app.key) || (googleAppKeys.has(app.key) && hasGoogleAuth),
      connectedAccount: googleAppKeys.has(app.key) && hasGoogleAuth ? (user?.email || "") : resolveConnectedAccount(app.key),
    })),
  });
};

exports.listConnections = async (req, res) => {
  const connections = await ConnectionService.list(req.user.id);
  res.json({ data: connections });
};

exports.saveConnection = async (req, res) => {
  const { appKey } = req.params;
  const connection = await ConnectionService.upsert(req.user.id, appKey, req.body || {});
  res.json({
    success: true,
    connection: {
      id: connection._id,
      appKey: connection.appKey,
      name: connection.name,
      verified: connection.verified,
      publicData: connection.publicData,
    },
  });
};

exports.getApp = async (req, res) => {
  const app = apps.find((item) => item.key === req.params.appKey);
  if (!app) return res.status(404).json({ error: "App not found" });
  const connection = await ConnectionService.get(req.user.id, app.key);
  res.json({ data: { ...app, connected: !!connection, connection: connection ? { publicData: connection.publicData } : null } });
};

exports.connectSlackOAuth = async (req, res) => {
  if (!process.env.SLACK_CLIENT_ID || !process.env.SLACK_CLIENT_SECRET) {
    const redirectPath = normalizeRedirectPath(req.query.redirect, "/apps");
    return res.redirect(`${clientUrl}${redirectPath}?slack_error=missing_oauth_config`);
  }

  const redirectPath = normalizeRedirectPath(req.query.redirect, "/apps");
  const state = jwt.sign(
    { ownerId: req.user.id, redirectPath },
    process.env.JWT_SECRET,
    { expiresIn: "10m" }
  );

  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID,
    scope: slackScopes,
    redirect_uri: `${backendBaseUrl}/api/apps/slack/callback`,
    state,
  });

  return res.redirect(`https://slack.com/oauth/v2/authorize?${params.toString()}`);
};

exports.handleSlackOAuthCallback = async (req, res) => {
  const fallbackRedirect = `${clientUrl}/apps?slack_error=oauth_failed`;

  try {
    const { code, state, error } = req.query;
    if (error) return res.redirect(`${clientUrl}/apps?slack_error=${encodeURIComponent(error)}`);
    if (!code || !state) return res.redirect(fallbackRedirect);

    const decoded = jwt.verify(String(state), process.env.JWT_SECRET);
    const redirectPath = normalizeRedirectPath(decoded.redirectPath, "/apps");
    const redirectUri = `${backendBaseUrl}/api/apps/slack/callback`;

    const tokenResponse = await axios.post("https://slack.com/api/oauth.v2.access",
      new URLSearchParams({
        code: String(code),
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        redirect_uri: redirectUri,
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    if (!tokenResponse.data?.ok || !tokenResponse.data?.access_token) {
      return res.redirect(`${clientUrl}${redirectPath}?slack_error=token_exchange_failed`);
    }

    await ConnectionService.upsert(decoded.ownerId, "slack", {
      token: tokenResponse.data.access_token,
      webhookUrl: tokenResponse.data.incoming_webhook?.url || "",
      name: `${tokenResponse.data.team?.name || "Slack"} connection`,
      teamName: tokenResponse.data.team?.name || "",
      teamId: tokenResponse.data.team?.id || "",
      botUserId: tokenResponse.data.bot_user_id || "",
      appId: tokenResponse.data.app_id || "",
      defaultChannel: tokenResponse.data.incoming_webhook?.channel || "",
      defaultChannelId: tokenResponse.data.incoming_webhook?.channel_id || "",
    });

    return res.redirect(`${clientUrl}${redirectPath}?slack_connected=1`);
  } catch (error) {
    console.error("Slack OAuth callback failed:", error.message);
    return res.redirect(fallbackRedirect);
  }
};

exports.connectNotionOAuth = async (req, res) => {
  if (!process.env.NOTION_CLIENT_ID || !process.env.NOTION_CLIENT_SECRET) {
    const redirectPath = normalizeRedirectPath(req.query.redirect, "/apps");
    return res.redirect(`${clientUrl}${redirectPath}?notion_error=missing_oauth_config`);
  }

  const redirectPath = normalizeRedirectPath(req.query.redirect, "/apps");
  const state = jwt.sign(
    { ownerId: req.user.id, redirectPath },
    process.env.JWT_SECRET,
    { expiresIn: "10m" }
  );

  const params = new URLSearchParams({
    client_id: process.env.NOTION_CLIENT_ID,
    response_type: "code",
    owner: "user",
    redirect_uri: `${oauthBaseUrl}/api/apps/notion/callback`,
    state,
  });

  if (notionScopes) params.set("scope", notionScopes);
  return res.redirect(`https://api.notion.com/v1/oauth/authorize?${params.toString()}`);
};

exports.handleNotionOAuthCallback = async (req, res) => {
  const fallbackRedirect = `${clientUrl}/apps?notion_error=oauth_failed`;

  try {
    const { code, state, error } = req.query;
    if (error) return res.redirect(`${clientUrl}/apps?notion_error=${encodeURIComponent(error)}`);
    if (!code || !state) return res.redirect(fallbackRedirect);

    const decoded = jwt.verify(String(state), process.env.JWT_SECRET);
    const redirectPath = normalizeRedirectPath(decoded.redirectPath, "/apps");
    const redirectUri = `${oauthBaseUrl}/api/apps/notion/callback`;
    const basic = Buffer.from(`${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`).toString("base64");

    const tokenResponse = await axios.post("https://api.notion.com/v1/oauth/token", {
      grant_type: "authorization_code",
      code: String(code),
      redirect_uri: redirectUri,
    }, {
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/json",
      },
    });

    if (!tokenResponse.data?.access_token) {
      return res.redirect(`${clientUrl}${redirectPath}?notion_error=token_exchange_failed`);
    }

    await ConnectionService.upsert(decoded.ownerId, "notion", {
      token: tokenResponse.data.access_token,
      name: `${tokenResponse.data.workspace_name || "Notion"} connection`,
      workspaceName: tokenResponse.data.workspace_name || "",
      workspaceId: tokenResponse.data.workspace_id || "",
      botId: tokenResponse.data.bot_id || "",
      ownerType: tokenResponse.data.owner?.type || "",
    });

    return res.redirect(`${clientUrl}${redirectPath}?notion_connected=1`);
  } catch (error) {
    console.error("Notion OAuth callback failed:", error.message);
    return res.redirect(fallbackRedirect);
  }
};

exports.connectGitHubOAuth = async (req, res) => {
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    const redirectPath = normalizeRedirectPath(req.query.redirect, "/apps");
    return res.redirect(`${clientUrl}${redirectPath}?github_error=missing_oauth_config`);
  }

  const redirectPath = normalizeRedirectPath(req.query.redirect, "/apps");
  const state = jwt.sign(
    { ownerId: req.user.id, redirectPath },
    process.env.JWT_SECRET,
    { expiresIn: "10m" }
  );

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    scope: githubScopes,
    redirect_uri: `${oauthBaseUrl}/api/apps/github/callback`,
    state,
  });

  return res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
};

exports.handleGitHubOAuthCallback = async (req, res) => {
  const fallbackRedirect = `${clientUrl}/apps?github_error=oauth_failed`;

  try {
    const { code, state, error } = req.query;
    if (error) return res.redirect(`${clientUrl}/apps?github_error=${encodeURIComponent(error)}`);
    if (!code || !state) return res.redirect(fallbackRedirect);

    const decoded = jwt.verify(String(state), process.env.JWT_SECRET);
    const redirectPath = normalizeRedirectPath(decoded.redirectPath, "/apps");
    const redirectUri = `${oauthBaseUrl}/api/apps/github/callback`;

    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: String(code),
        redirect_uri: redirectUri,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    const accessToken = tokenResponse.data?.access_token;
    if (!accessToken) {
      return res.redirect(`${clientUrl}${redirectPath}?github_error=token_exchange_failed`);
    }

    const profileResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "ORvexia",
      },
    });

    let primaryEmail = profileResponse.data?.email || "";
    if (!primaryEmail) {
      const emailsResponse = await axios.get("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "ORvexia",
        },
      });

      const emails = Array.isArray(emailsResponse.data) ? emailsResponse.data : [];
      const preferred = emails.find((item) => item.primary && item.verified) || emails.find((item) => item.verified);
      primaryEmail = preferred?.email || "";
    }

    await ConnectionService.upsert(decoded.ownerId, "github", {
      token: accessToken,
      name: `${profileResponse.data?.login || "GitHub"} connection`,
      username: profileResponse.data?.login || "",
      email: primaryEmail,
      profileUrl: profileResponse.data?.html_url || "",
      avatarUrl: profileResponse.data?.avatar_url || "",
    });

    return res.redirect(`${clientUrl}${redirectPath}?github_connected=1`);
  } catch (error) {
    console.error("GitHub OAuth callback failed:", error.message);
    return res.redirect(fallbackRedirect);
  }
};

exports.handleSlackEvents = async (req, res) => {
  console.log("[SLACK_EVENT] === INCOMING REQUEST ===");
  console.log("[SLACK_EVENT] Body type:", req.body?.type, "Has event:", !!req.body?.event);
  console.log("[SLACK_EVENT] Headers User-Agent:", req.headers['user-agent']);
  
  // Handle Slack URL Verification Challenge
  if (req.body && req.body.type === "url_verification") {
    console.log("[SLACK_EVENT] Challenge received, responding:", req.body.challenge);
    return res.status(200).send(req.body.challenge);
  }

  // Handle Slack Events (Triggers)
  if (req.body && req.body.event) {
    const event = req.body.event;
    const eventType = String(event.type || "").toLowerCase();

    console.log("[SLACK_EVENT] Received:", eventType, "text:", event.text, "from:", event.user, "bot_id:", event.bot_id);

    // Ignore bot/self echoes to prevent loops
    if (event.bot_id || event.subtype === "bot_message") {
      console.log("[SLACK_EVENT] Ignored (bot message)");
      return res.status(200).send("OK");
    }
    if (!["message", "app_mention"].includes(eventType)) {
      console.log("[SLACK_EVENT] Ignored (unsupported event type:", eventType, ")");
      return res.status(200).send("OK");
    }

    try {
      const Workflow = require("../models/workflow-model");
      const WorkflowVersion = require("../models/workflowVersion-model");
      const Execution = require("../models/execution-model");
      const { runWorkflow } = require("../engine/workflowRunner");
      const ConnectionService = require("../services/ConnectionService");

      // 1. Find the connection to identify the user
      const teamId = req.body.team_id;
      console.log("[SLACK_EVENT] Looking up teamId:", teamId);

      const connections = await ConnectionService.listAllByApp("slack");
      console.log("[SLACK_EVENT] Found", connections.length, "slack connections");

      const matchingConnections = connections.filter(c => c.publicData && c.publicData.teamId === teamId);

      if (matchingConnections.length === 0) {
        console.log("[SLACK_EVENT] No connection found for teamId:", teamId);
        return res.status(200).send("OK");
      }

      const mongoose = require("mongoose");
      let allWorkflows = [];

      for (const connection of matchingConnections) {
        const ownerId = String(connection.userId);
        const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
        console.log("[SLACK_EVENT] Found owner:", ownerId);
        
        // 2. Find active workflows for this user
        const ownerWorkflows = await Workflow.find({ owner_id: ownerObjectId, is_active: true });
        console.log("[SLACK_EVENT] Found", ownerWorkflows.length, "active workflows for owner", ownerId);
        allWorkflows = allWorkflows.concat(ownerWorkflows);
      }

      for (const workflow of allWorkflows) {
        if (!workflow.active_version_id) {
          console.log("[SLACK_EVENT] Skipping workflow", workflow.name, "- no active version");
          continue;
        }
        
        const version = await WorkflowVersion.findById(workflow.active_version_id);
        if (!version) {
          console.log("[SLACK_EVENT] Skipping workflow", workflow.name, "- version not found");
          continue;
        }

        // 3. Check if workflow has ANY Slack trigger node
        const nodes = version.definition.nodes || [];
        const edges = version.definition.edges || [];
        
        const triggerNode = nodes.find((n) => {
          const label = String(n.data && n.data.label || n.data && n.data.app || "").trim().toLowerCase();
          if (label !== "slack") return false;
          const nodeType = String(n.data && n.data.nodeType || "").toLowerCase();
          const category = String(n.data && n.data.category || "").toLowerCase();
          // Match if it's explicitly a trigger OR if it's categorized as a trigger
          return nodeType === "trigger" || category === "trigger";
        });

        if (!triggerNode) {
          console.log("[SLACK_EVENT] Workflow", workflow.name, "- no Slack trigger node found");
          continue;
        }

        console.log("[SLACK_EVENT] MATCH! Workflow:", workflow.name, "trigger node:", triggerNode.id);

        // 4. Create execution and run the workflow
        const contextData = {
          slack_event: event,
          __startNodeId: triggerNode.id,
          channel: event.channel,
          text: event.text,
          user: event.user,
          ts: event.ts,
        };

        const execution = await Execution.create({
          workflow_id: workflow._id,
          version_id: version._id,
          status: "PENDING",
          contextData: contextData,
          checkpoint: { contextData: contextData },
          logs: []
        });

        console.log("[SLACK_EVENT] Created execution:", execution._id, "for workflow:", workflow.name);

        // Run in background
        runWorkflow(nodes, edges, execution, req.io).then(() => {
          console.log("[SLACK_EVENT] Execution completed for:", workflow.name);
        }).catch((err) => {
          console.error("[SLACK_EVENT] Execution FAILED for:", workflow.name, err.message);
        });
      }
    } catch (error) {
      console.error("[SLACK_EVENT] Processing failed:", error.message, error.stack);
    }
  }
  
  res.status(200).send("OK");
};
