const Bin = require("../models/Bin");
const Settings = require("../models/Settings");
const { sendAlertEmail } = require("../utils/mailer");

const calculateFill = (distance, binHeight) => {
  if (distance < 5) return 100;
  if (distance > binHeight) return 0;
  let fill = ((binHeight - distance) / (binHeight - 5)) * 100;
  return Math.min(100, Math.max(0, Math.round(fill)));
};

exports.updateBin = async (req, res) => {
  const { id, distance, lat, lng } = req.body;
  if (!id || distance === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    let settings = await Settings.findOne({ id: "global_settings" });
    if (!settings) settings = new Settings({ id: "global_settings" });

    let bin = await Bin.findOne({ id });
    if (!bin) {
      bin = new Bin({ id, lat, lng });
    }

    const fill_percent = calculateFill(distance, bin.binHeight);
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    const updateData = {
      distance,
      fill_percent,
      last_updated: new Date().toLocaleTimeString(),
      last_seen: new Date()
    };

    if (lat !== undefined) updateData.lat = lat;
    if (lng !== undefined) updateData.lng = lng;

    let shouldPushHistory = true;
    if (bin.fill_percent === fill_percent && bin.distance === distance) {
      shouldPushHistory = false;
    }

    const updateQuery = { $set: updateData };
    if (shouldPushHistory) {
      updateQuery.$push = {
        history: {
          $each: [{
            time: timeStr,
            timestamp: new Date(),
            fill: fill_percent
          }],
          $slice: -200
        }
      };
    }

    bin = await Bin.findOneAndUpdate(
      { id },
      updateQuery,
      { upsert: true, new: true }
    );

    // Email alert logic
    if (settings.emailAlertsEnabled && fill_percent >= settings.alertThreshold && !bin.alert_sent) {
      bin.alert_sent = true;
      await bin.save();
      await sendAlertEmail(settings.receiverEmail, bin.nickname || id, fill_percent);
    }
    if (fill_percent < 20 && bin.alert_sent) {
      bin.alert_sent = false;
      await bin.save();
    }

    res.json({ success: true, bin, recorded: shouldPushHistory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBins = async (req, res) => {
  try {
    const bins = await Bin.find();
    const binObj = {};
    bins.forEach(b => { binObj[b.id] = b; });
    res.json(binObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.renameBin = async (req, res) => {
  const { id, nickname, binHeight } = req.body;
  try {
    const update = { nickname };
    if (binHeight !== undefined) update.binHeight = binHeight;
    await Bin.updateOne({ id }, { $set: update });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteBin = async (req, res) => {
  try {
    await Bin.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetHistory = async (req, res) => {
  try {
    await Bin.updateOne({ id: req.params.id }, { $set: { history: [] } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.testAlert = async (req, res) => {
  try {
    let settings = await Settings.findOne({ id: "global_settings" });
    if (!settings) settings = new Settings({ id: "global_settings" });
    await sendAlertEmail(settings.receiverEmail, "Test-Bin", 85);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
