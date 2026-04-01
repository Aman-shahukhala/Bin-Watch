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
    res.status(500).json({ error: "An unexpected error occurred while fetching configuration settings" });
  }
};

exports.updateSettings = async (req, res) => {
  if (req.session.role === 'demo') return res.status(403).json({ error: "Action disabled in Demo Mode" });
  try {
    const { pollingInterval, emailAlertsEnabled, alertThreshold, receiverEmail, soundAlertsEnabled, depotLat, depotLng, systemMode, buildingName } = req.body;
    const settings = await Settings.findOneAndUpdate(
      { id: "global_settings" },
      { $set: { pollingInterval, emailAlertsEnabled, alertThreshold, receiverEmail, soundAlertsEnabled, depotLat, depotLng, systemMode, buildingName } },
      { upsert: true, returnDocument: 'after' }
    );
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: "An unexpected error occurred while applying configuration settings" });
  }
};
