const User = require('../models/User');

exports.getStaff = async (req, res) => {
  if (req.session.role !== 'admin' && req.session.userId !== 'admin') {
     const u = await User.findById(req.session.userId);
     if (!u || u.username !== 'admin') return res.status(403).json({ error: "Access denied" });
  }
  try {
    const staff = await User.find({}, 'username role assignedBins isOnline lastLocation lastUpdate');
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve team members" });
  }
};

exports.addStaff = async (req, res) => {
  if (req.session.role !== 'admin' && req.session.userId !== 'admin') {
     const u = await User.findById(req.session.userId);
     if (!u || u.username !== 'admin') return res.status(403).json({ error: "Access denied" });
  }
  try {
    const { username, password, role, assignedBins } = req.body;
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: "Invalid input format" });
    }
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const newStaff = new User({ username, password, role, assignedBins });
    await newStaff.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to create team member account" });
  }
};

exports.removeStaff = async (req, res) => {
  if (req.session.role !== 'admin') return res.status(403).json({ error: "Access denied: Admin only" });
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.username === 'admin') return res.status(400).json({ error: "Cannot remove core admin" });

    await User.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove staff member" });
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
    res.status(500).json({ error: "Failed to update staff credentials" });
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
    res.status(500).json({ error: "Location update failed" });
  }
};
