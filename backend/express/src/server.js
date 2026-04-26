const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config({ path: path.join(__dirname, '../../.env') });
require("./config/mongoose-connection");
const workflowRouter = require("./routes/workflowRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
// const appsRouter = require("./routes/apps.routes");
const userRoutes = require("./routes/user.routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const passport = require("./config/passport");
const authRoutes = require("./routes/authRoutes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://orvexia.vercel.app"], 
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 1. CORS MUST BE FIRST
app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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

app.get('/', (req, res) => {
  res.send('Express Server Running');
});

app.use('/api/workflows', workflowRouter);
app.use('/api/webhook', webhookRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);

const port = process.env.PORT || 3000;
const ngrokToken = process.env.NGROK_API_KEY;

server.listen(port, async () => {
  console.log(`Server is running on port ${port}`);

  if (ngrokToken) {
    try {
      const ngrok = require('@ngrok/ngrok');
      const listener = await ngrok.forward({ addr: port, authtoken: ngrokToken });
      console.log(`[Ngrok] Tunnel active at: ${listener.url()}`);
      console.log(`[Ngrok] Use this URL for Webhook Configurations!`);
    } catch (err) {
      console.error(`[Ngrok] Failed to start tunnel:`, err.message);
    }
  }
});
