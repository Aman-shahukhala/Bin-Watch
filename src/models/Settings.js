const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  id: { type: String, default: "global_settings", unique: true },
  pollingInterval: { type: Number, default: 2 },
  emailAlertsEnabled: { type: Boolean, default: true },
  alertThreshold: { type: Number, default: 80 },
  receiverEmail: { type: String, default: "ezzet.og.01@gmail.com" },
  soundAlertsEnabled: { type: Boolean, default: true },
  depotLat: { type: Number, default: 27.713384 },
  depotLng: { type: Number, default: 85.329393 }
});

module.exports = mongoose.model("Settings", settingsSchema);
