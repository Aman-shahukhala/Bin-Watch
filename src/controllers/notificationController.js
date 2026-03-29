const webpush = require('web-push');
const User = require('../models/User');

// Initialize WebPush with VAPID keys from .env
webpush.setVapidDetails(
  'mailto:aman.shahukhala@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

exports.subscribe = async (req, res) => {
  try {
    const subscription = req.body;
    const userId = req.session.userId;
    
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check if subscription already exists to avoid duplicates
    const exists = user.pushSubscriptions.find(s => s.endpoint === subscription.endpoint);
    if (!exists) {
      user.pushSubscriptions.push(subscription);
      await user.save();
    }

    res.status(201).json({ success: true });
  } catch (err) {
    console.error("Subscription Error:", err);
    res.status(500).json({ error: "Failed to subscribe" });
  }
};

exports.sendTestNotification = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId);
    
    if (!user || user.pushSubscriptions.length === 0) {
      return res.status(400).json({ error: "No active subscriptions found for this user." });
    }

    const payload = JSON.stringify({
      title: 'BinWatch Pro Test',
      body: 'Notifications are active and working!',
      icon: '/favicon.png'
    });

    const notifications = user.pushSubscriptions.map(sub => 
      webpush.sendNotification(sub, payload).catch(err => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Remove expired subscription
          user.pushSubscriptions = user.pushSubscriptions.filter(s => s.endpoint !== sub.endpoint);
        }
      })
    );

    await Promise.all(notifications);
    await user.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Notification Error:", err);
    res.status(500).json({ error: "Failed to send notification" });
  }
};
