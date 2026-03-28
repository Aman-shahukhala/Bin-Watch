const mongoose = require("mongoose");

const binSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  nickname: { type: String, default: "" },
  fill_percent: { type: Number, default: 0 },
  distance: { type: Number, default: 0 },
  last_updated: { type: String, default: "Never" },
  last_seen: { type: Date, default: Date.now },
  alert_sent: { type: Boolean, default: false },
  lat: { type: Number, default: 27.712629 },
  lng: { type: Number, default: 85.329363 },
  binHeight: { type: Number, default: 20 },
  history: [{
    time: String,
    timestamp: { type: Date, default: Date.now },
    fill: Number
  }]
});

module.exports = mongoose.model("Bin", binSchema);
