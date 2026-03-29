const User = require('../models/User');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Type checking to prevent NoSQL injection via objects
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: "Invalid input format" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const isAdmin = user.username === 'admin' && (!user.role || user.role === undefined);
    const role = isAdmin ? 'admin' : user.role;
    req.session.userId = user._id.toString();
    req.session.role = role;
    req.session.assignedBins = user.assignedBins || [];
    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ error: "Session establishment failed" });
      }
      res.json({ success: true, role: role });
    });
    return; // early exit after custom handling
  } catch (err) {
    res.status(500).json({ error: "An internal server error occurred" });
  }
};

exports.me = async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // Identity Patch: Ensure core admin account always has admin role even if session is old
    let role = user.role;
    if (user.username === 'admin' && !role) role = 'admin';
    
    res.json({ 
      username: user.username, 
      role: role, 
      assignedBins: user.assignedBins 
    });
  } catch (err) {
    res.status(500).json({ error: "Identity verification failed" });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("[AUTH] Logout session destruction failure:", err);
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie('__binwatch_sid'); // explicitly clear the session cookie
    res.json({ success: true });
  });
};

exports.seedAdmin = async () => {
  try {
    let admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      admin = new User({ username: 'admin', password: 'admin123', role: 'admin' });
      await admin.save();
      console.warn("[SECURITY] ATTENTION: Default admin user created (admin / admin123). CHANGE THIS PASSWORD IMMEDIATELY.");
    } else if (!admin.role) {
      // Repair: patch missing role for admin accounts created before RBAC
      await User.updateOne({ username: 'admin' }, { $set: { role: 'admin' } });
      console.log("[AUTH] Admin role patched in database.");
    }
  } catch (err) {
    console.error("[AUTH] Error seeding admin:", "An error occurred during database setup");
  }
};
