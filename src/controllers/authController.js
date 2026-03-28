const User = require('../models/User');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    req.session.userId = user._id;
    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to establish secure session: " + err.message });
      }
      res.json({ success: true });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.json({ success: true });
};

exports.seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const admin = new User({ username: 'admin', password: 'admin123' });
      await admin.save();
      console.log("[AUTH] Default admin user created (admin / admin123)");
    }
  } catch (err) {
    console.error("[AUTH] Error seeding admin:", err.message);
  }
};
