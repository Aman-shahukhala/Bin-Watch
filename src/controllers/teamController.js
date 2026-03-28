const User = require('../models/User');

exports.getStaff = async (req, res) => {
  if (req.session.role !== 'admin' && req.session.userId !== 'admin') {
     const User = require('../models/User');
     const u = await User.findById(req.session.userId);
     if (!u || u.username !== 'admin') return res.status(403).json({ error: "Access denied" });
  }
  try {
    const staff = await User.find({}, 'username role assignedBins isOnline lastLocation lastUpdate');
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addStaff = async (req, res) => {
  if (req.session.role !== 'admin' && req.session.userId !== 'admin') {
     const User = require('../models/User');
     const u = await User.findById(req.session.userId);
     if (!u || u.username !== 'admin') return res.status(403).json({ error: "Access denied" });
  }
  try {
    const { username, password, role, assignedBins } = req.body;
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const newStaff = new User({ username, password, role, assignedBins });
    await newStaff.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeStaff = async (req, res) => {
  if (req.session.role !== 'admin') return res.status(403).json({ error: "Access denied: Admin only" });
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (user.username === 'admin') return res.status(400).json({ error: "Cannot remove core admin" });

    await User.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateStaff = async (req, res) => {
  if (req.session.role !== 'admin') return res.status(403).json({ error: "Access denied: Admin only" });
  try {
    const { id } = req.params;
    const { role, assignedBins } = req.body;
    await User.findByIdAndUpdate(id, { role, assignedBins });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Driver updates their own live GPS location
exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng, isOnline } = req.body;
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    await User.findByIdAndUpdate(userId, {
      lastLocation: { lat, lng },
      isOnline: isOnline !== undefined ? isOnline : true,
      lastUpdate: new Date()
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
