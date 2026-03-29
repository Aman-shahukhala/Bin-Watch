const Bin = require("../models/Bin");
const Settings = require("../models/Settings");
const { sendAlertEmail } = require("../utils/mailer");
const { notifyAdmins } = require("../utils/push");

const calculateFill = (distance, binHeight) => {
  if (distance < 5) return 100;
  if (distance > binHeight) return 0;
  let fill = ((binHeight - distance) / (binHeight - 5)) * 100;
  return Math.min(100, Math.max(0, Math.round(fill)));
};

exports.updateBin = async (req, res) => {
  const { id, distance, lat, lng } = req.body;
  if (!id || typeof id !== 'string' || distance === undefined) {
    return res.status(400).json({ error: "Invalid data format or missing fields" });
  }

  try {
    let settings = await Settings.findOne({ id: "global_settings" });
    if (!settings) settings = new Settings({ id: "global_settings" });

    let bin = await Bin.findOne({ id });
    const isCampus = settings.systemMode === 'campus';

    if (!bin) {
      bin = new Bin({ 
        id, 
        lat: settings.depotLat, 
        lng: settings.depotLng,
        binType: isCampus ? 'indoor' : 'street',
        floor: isCampus ? 'Ground' : '',
        x: isCampus ? 500 : 0,
        y: isCampus ? 500 : 0
      });
      await bin.save();
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
          $slice: -1500
        }
      };
    }

    bin = await Bin.findOneAndUpdate(
      { id },
      updateQuery,
      { upsert: true, returnDocument: 'after' }
    );

    // Email alert logic
    if (settings.emailAlertsEnabled && fill_percent >= settings.alertThreshold && !bin.alert_sent) {
      bin.alert_sent = true;
      await bin.save();
      await sendAlertEmail(settings.receiverEmail, bin.nickname || id, fill_percent);
      
      // Trigger WebPush for Admins
      await notifyAdmins({
        title: `CRITICAL ALERT: ${bin.nickname || id}`,
        body: `Bin reached ${fill_percent}% capacity. Immediate collection required.`,
        icon: '/favicon.png'
      });
    }
    if (fill_percent < 20 && bin.alert_sent) {
      bin.alert_sent = false;
      await bin.save();
    }

    res.json({ success: true, bin, recorded: shouldPushHistory });
  } catch (err) {
    res.status(500).json({ error: "An error occurred while updating the node" });
  }
};

exports.getBins = async (req, res) => {
  try {
    const role = req.session.role;
    const assigned = req.session.assignedBins || [];
    
    let query = {};
    if (role === 'driver') {
      query = { id: { $in: assigned } };
    }

    const bins = await Bin.find(query);
    const binObj = {};
    bins.forEach(b => { binObj[b.id] = b; });
    res.json(binObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.renameBin = async (req, res) => {
  if (req.session.role !== 'admin') return res.status(403).json({ error: "Access denied: Admin only" });
    const { id, nickname, binHeight, binType, floor, x, y, lat, lng } = req.body;
    try {
      const update = { 
        nickname: String(nickname),
        binType: String(binType || 'street'),
        floor: String(floor || 'Ground'),
        x: Number(x || 0),
        y: Number(y || 0)
      };
      if (binHeight !== undefined) update.binHeight = Number(binHeight);
      if (lat !== undefined) update.lat = Number(lat);
      if (lng !== undefined) update.lng = Number(lng);

      await Bin.updateOne({ id: String(id) }, { $set: update });
      res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to apply naming configuration" });
  }
};

exports.deleteBin = async (req, res) => {
  if (req.session.role !== 'admin') return res.status(403).json({ error: "Access denied: Admin only" });
  try {
    await Bin.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetHistory = async (req, res) => {
  if (req.session.role !== 'admin') return res.status(403).json({ error: "Access denied: Admin only" });
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
