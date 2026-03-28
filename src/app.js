const express = require("express");
const path = require("path");
const binRoutes = require("./routes/binRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const authRoutes = require("./routes/authRoutes");
const teamRoutes = require("./routes/teamRoutes");
const authMiddleware = require("./middleware/auth");

const app = express();

const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: "userSessions"
});

app.use(session({
  secret: process.env.SESSION_SECRET || "fallback-secret-if-missing",
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  }
}));

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/api/settings", authMiddleware, settingsRoutes);
app.use("/api/team", authMiddleware, teamRoutes);

// Protect index.html specifically before static middleware
app.use(['/', '/index.html'], (req, res, next) => {
  if (req.path === '/' || req.path === '/index.html') {
    return authMiddleware(req, res, next);
  }
  next();
});

app.use(express.static(path.join(__dirname, "../public")));

// Protect Dashboard API Actions, but allow ESP32 /update
app.use("/data", authMiddleware);
app.use("/rename", authMiddleware);
app.use("/bin", authMiddleware);
app.use("/reset-history", authMiddleware);
app.use("/test-alert", authMiddleware);

// API Routes
app.use("/", binRoutes);

module.exports = app;
