module.exports = (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    // If it's an API request, return 401
    if (req.originalUrl.startsWith('/api/') || req.originalUrl === '/data') {
      res.status(401).json({ error: "Unauthorized" });
    } else {
      // Otherwise redirect to login page
      res.redirect('/login.html');
    }
  }
};
