const Settings = require("../models/Settings");

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ id: "global_settings" });
    if (!settings) {
      settings = new Settings({ id: "global_settings" });
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { pollingInterval, emailAlertsEnabled, alertThreshold, receiverEmail, soundAlertsEnabled, depotLat, depotLng } = req.body;
    const settings = await Settings.findOneAndUpdate(
      { id: "global_settings" },
      { $set: { pollingInterval, emailAlertsEnabled, alertThreshold, receiverEmail, soundAlertsEnabled, depotLat, depotLng } },
      { upsert: true, returnDocument: 'after' }
    );
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
