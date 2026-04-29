const express = require("express");
const path = require("path");
const fs = require("fs");
const http = require("http");
const net = require("net");
const { Server } = require("socket.io");
require("./config/loadEnv");
require("./config/mongoose-connection");
const workflowRouter = require("./routes/workflowRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const appsRouter = require("./routes/apps.routes");
const userRoutes = require("./routes/user.routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const passport = require("./config/passport");
const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/ai.routes");

const blueprintController = require('./controllers/blueprintController');
const blueprintRoutes = require('./routes/blueprintRoutes');
const app = express();
app.set('trust proxy', 1); // Trust first proxy (ngrok)
const server = http.createServer(app);
fs.mkdirSync(path.resolve(process.cwd(), "scratch"), { recursive: true });

const parseAllowedOrigins = () => {
  const envOrigins = [
    process.env.CLIENT_URL,
    process.env.CORS_ORIGINS,
  ]
    .filter(Boolean)
    .flatMap((value) => String(value).split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  return Array.from(new Set([
    "http://localhost:5173",
    "https://orvexia.vercel.app",
    "https://orvexiaaiautomation.vercel.app",
    ...envOrigins,
  ]));
};

const allowedOrigins = parseAllowedOrigins();

const corsOriginResolver = (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) {
    return callback(null, true);
  }

  return callback(new Error(`CORS blocked for origin: ${origin}`));
};

const io = new Server(server, {
  cors: {
    origin: corsOriginResolver,
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.get("/", (req, res) => {
  res.send("Express Server Running");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    service: "orvexia-backend",
    time: new Date().toISOString(),
  });
});

// 1. CORS MUST BE FIRST
app.use(
  cors({
    origin: corsOriginResolver,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

// 2. INCREASE BODY LIMITS FOR IMAGES
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use(session({
  secret: process.env.JWT_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/workflows', workflowRouter);
app.use('/api/webhook', webhookRoutes);
app.use('/api/apps', appsRouter);
app.use("/api/v1/users", userRoutes);
app.use('/api/blueprints', blueprintRoutes);
app.use('/api/v1/auth', authRoutes);
app.use("/api/ai", aiRoutes);

const preferredPort = Number(process.env.PORT || 3000);
const ngrokToken = process.env.NGROK_AUTHTOKEN || process.env.NGROK_API_KEY;
const getOauthBaseUrl = (activePort) =>
  process.env.OAUTH_PUBLIC_URL || process.env.BACKEND_PUBLIC_URL || `http://localhost:${activePort}`;

const startServer = (portToUse) => server.listen(portToUse, async () => {
  const oauthBaseUrl = getOauthBaseUrl(portToUse);
  console.log(`Server is running on port ${portToUse}`);
  console.log(`[Auth] OAuth callback base URL: ${oauthBaseUrl}`);
  console.log(`[CORS] Allowed origins: ${allowedOrigins.join(", ")}`);
  if ((process.env.BACKEND_PUBLIC_URL || "").includes("ngrok") && !process.env.OAUTH_PUBLIC_URL) {
    console.warn("[Auth] BACKEND_PUBLIC_URL uses ngrok. Set OAUTH_PUBLIC_URL to a stable callback URL (example: http://localhost:3000) to avoid redirect_uri_mismatch.");
  }

  if (ngrokToken) {
    try {
      if (String(ngrokToken).startsWith("ak_") && !process.env.NGROK_AUTHTOKEN) {
        console.warn("[Ngrok] NGROK_API_KEY looks like a dashboard API key. For tunnels, use NGROK_AUTHTOKEN from 'Your Authtoken'. Skipping tunnel.");
        return;
      }
      const ngrok = require('@ngrok/ngrok');
      const listener = await ngrok.forward({ addr: portToUse, authtoken: ngrokToken });
      await blueprintController.seedPowerTrio();
      console.log('✅ MongoDB connected successfully');
      console.log(`[Ngrok] Tunnel active at: ${listener.url()}`);
      console.log(`[Ngrok] Use this URL for Webhook Configurations!`);
    } catch (err) {
      console.error(`[Ngrok] Failed to start tunnel:`, err.message);
    }
  }

  // Start Slack Message Poller (disabled until channels:history scope is granted via reconnect)
  /* TEMPORARILY DISABLED — re-enable after Slack reconnection via ORvexia
  try {
    const SlackPoller = require('./services/SlackPoller');
    const ConnectionService = require('./services/ConnectionService');
    const mongoose = require('mongoose');
    
    // Wait a moment for MongoDB to be ready
    setTimeout(async () => {
      try {
        const Connection = require('./models/Connection');
        const slackConns = await Connection.find({ appKey: 'slack' });
        
        for (const conn of slackConns) {
          if (!conn.publicData?.teamId) continue;
          
          // Use the user token for reading (has channels:history scope)
          // Fall back to bot token or encrypted token from DB
          const CryptoService = require('./services/CryptoService');
          let readToken = process.env.SLACK_USER_TOKEN || process.env.SLACK_BOT_TOKEN;
          if (!readToken && conn.data?.token) {
            try { readToken = CryptoService.decrypt(conn.data.token); } catch(e) {}
          }
          let botToken = readToken;
          
          if (!botToken) {
            console.log('[SlackPoller] No bot token found for team', conn.publicData.teamId);
            continue;
          }

          // Get channels where the bot is a member
          try {
            const channelRes = await require('axios').get('https://slack.com/api/conversations.list', {
              headers: { Authorization: `Bearer ${botToken}` },
              params: { types: 'public_channel', limit: 100 }
            });
            
            if (channelRes.data.ok) {
              const channels = channelRes.data.channels.filter(c => c.is_member);
              console.log(`[SlackPoller] Bot is in ${channels.length} channels:`, channels.map(c => '#' + c.name).join(', '));
              
              for (const channel of channels) {
                const poller = new SlackPoller(botToken, channel.id, async (event) => {
                  // Simulate the same flow as handleSlackEvents
                  const Workflow = require('./models/workflow-model');
                  const WorkflowVersion = require('./models/workflowVersion-model');
                  const Execution = require('./models/execution-model');
                  const { runWorkflow } = require('./engine/workflowRunner');
                  
                  const ownerId = conn.owner_id;
                  const ownerObjectId = new mongoose.Types.ObjectId(String(ownerId));
                  
                  const workflows = await Workflow.find({ owner_id: ownerObjectId, is_active: true });
                  console.log(`[SlackPoller] Found ${workflows.length} active workflows for owner`);
                  
                  for (const workflow of workflows) {
                    if (!workflow.active_version_id) continue;
                    
                    const version = await WorkflowVersion.findById(workflow.active_version_id);
                    if (!version?.definition?.nodes) continue;
                    
                    const triggerNode = version.definition.nodes.find(n => {
                      const d = n.data || {};
                      return (String(d.app || '').toLowerCase() === 'slack') &&
                             (String(d.nodeType || '').toLowerCase() === 'trigger');
                    });
                    
                    if (!triggerNode) continue;
                    
                    console.log(`[SlackPoller] MATCH! Workflow: ${workflow.name}`);
                    
                    const execution = await Execution.create({
                      workflow_id: workflow._id,
                      version_id: version._id,
                      status: 'RUNNING',
                      trigger: { type: 'slack_poll', event },
                      steps: [],
                      logs: [{ level: 'INFO', message: 'Workflow execution started', ts: new Date() }],
                      startedAt: new Date()
                    });
                    
                    try {
                      await runWorkflow(version.definition, {
                        executionId: execution._id,
                        trigger: { slack_event: event },
                        workflowOwnerId: String(ownerId),
                        __startNodeId: triggerNode.id
                      });
                      
                      execution.status = 'COMPLETED';
                      execution.logs.push({ level: 'INFO', message: 'Workflow execution completed', ts: new Date() });
                      console.log(`[SlackPoller] Execution completed for: ${workflow.name}`);
                    } catch (err) {
                      execution.status = 'FAILED';
                      execution.logs.push({ level: 'ERROR', message: String(err.message), ts: new Date() });
                      console.error(`[SlackPoller] Execution FAILED for: ${workflow.name}`, err.message);
                    }
                    
                    execution.completedAt = new Date();
                    await execution.save();
                  }
                });
                
                poller.start(5000); // Poll every 5 seconds
              }
            }
          } catch(e) {
            console.error('[SlackPoller] Failed to list channels:', e.message);
          }
        }
      } catch(e) {
        console.error('[SlackPoller] Init error:', e.message);
      }
    }, 3000); // Wait 3 seconds for DB connection
  } catch(e) {
    console.error('[SlackPoller] Setup error:', e.message);
  }
  */
});

const isPortFree = (port) =>
  new Promise((resolve) => {
    const tester = net.createServer();
    tester.once("error", () => resolve(false));
    tester.once("listening", () => tester.close(() => resolve(true)));
    tester.listen({ port, host: "::" });
  });

const findAvailablePort = async (startPort) => {
  let candidate = startPort;
  for (let i = 0; i < 20; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const free = await isPortFree(candidate);
    if (free) return candidate;
    console.warn(`[Server] Port ${candidate} is busy. Trying ${candidate + 1}...`);
    candidate += 1;
  }
  throw new Error(`No free port found in range ${startPort}-${startPort + 20}`);
};

(async () => {
  try {
    const activePort = await findAvailablePort(preferredPort);
    startServer(activePort);
    console.log(`[Server] Active port: ${activePort}`);
    
    // Start Automation Service
    const AutomationService = require('./services/AutomationService');
    AutomationService.start();
    
  } catch (err) {
    console.error("[Server] Failed to boot:", err.message);
    process.exit(1);
  }
})();
