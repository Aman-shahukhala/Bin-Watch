const express = require("express");
const path = require("path");
const binRoutes = require("./routes/binRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// API Routes
app.use("/", binRoutes);
app.use("/api/settings", settingsRoutes);

module.exports = app;
