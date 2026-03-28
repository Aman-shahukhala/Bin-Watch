const User = require('../models/User');

exports.getStaff = async (req, res) => {
  if (req.session.role !== 'admin' && req.session.userId !== 'admin') {
     // Secondary check for username if role is missing in stale session
     const User = require('../models/User');
     const u = await User.findById(req.session.userId);
     if (!u || u.username !== 'admin') return res.status(403).json({ error: "Access denied" });
  }
  try {
    const staff = await User.find({}, 'username role assignedBins');
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
    // Don't allow removing the main admin account if it's the only one
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
