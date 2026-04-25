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

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://orvexia.vercel.app"], 
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["http://localhost:5173", "https://orvexia.vercel.app"], 
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);
app.use(cookieParser());

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

const port = process.env.PORT || 3000;


server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
