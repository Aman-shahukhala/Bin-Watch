const express = require("express");
const path = require("path");
const binRoutes = require("./routes/binRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const authRoutes = require("./routes/authRoutes");
const teamRoutes = require("./routes/teamRoutes");
const authMiddleware = require("./middleware/auth");

const helmet = require("helmet");

const app = express();


// Security Headers - Relaxed for compatibility with inline handlers and CDN resources
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      "default-src": ["'self'", "https://unpkg.com", "https://cdn.jsdelivr.net"],
      "script-src":  ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://cdn.jsdelivr.net"],
      "script-src-attr": ["'unsafe-inline'"], // Required for onclick="..." handlers
      "style-src":   ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://fonts.googleapis.com"],
      "font-src":    ["'self'", "https://fonts.gstatic.com"],
      "img-src":     ["'self'", "data:", "blob:", "https://*.tile.openstreetmap.org", "https://unpkg.com"],
      "connect-src": ["'self'", "https://router.project-osrm.org", "https://unpkg.com", "https://*.tile.openstreetmap.org", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      "worker-src":  ["'self'", "blob:"],
      "upgrade-insecure-requests": null,
    },
  },
}));


const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: "userSessions"
});

app.use(session({
  secret: process.env.SESSION_SECRET || "fallback-secret-if-missing",
  resave: false,
  saveUninitialized: false,
  store: store,
  name: '__binwatch_sid', // customized session ID
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
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
