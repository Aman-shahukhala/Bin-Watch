const webpush = require('web-push');
const User = require('../models/User');

// Initialize WebPush
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:aman.shahukhala@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

exports.notifyAdmins = async (payload) => {
  try {
    // Find all users with admin role and active subscriptions
    const admins = await User.find({ 
      role: 'admin', 
      'pushSubscriptions.0': { $exists: true } 
    });

    const notifications = [];

    admins.forEach(admin => {
      admin.pushSubscriptions.forEach(sub => {
        notifications.push(
          webpush.sendNotification(sub, JSON.stringify(payload)).catch(err => {
            if (err.statusCode === 410 || err.statusCode === 404) {
              // Mark for removal if subscription has expired
              return { error: true, endpoint: sub.endpoint, userId: admin._id };
            }
          })
        );
      });
    });

    const results = await Promise.all(notifications);
    
    // Cleanup expired subscriptions
    for (const res of results) {
      if (res && res.error) {
        await User.findByIdAndUpdate(res.userId, {
          $pull: { pushSubscriptions: { endpoint: res.endpoint } }
        });
      }
    }
  } catch (err) {
    console.error("Critical Push Failure:", err);
  }
};
