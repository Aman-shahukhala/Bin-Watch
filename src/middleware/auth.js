module.exports = (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    const isApi = req.originalUrl.startsWith('/api/') || 
                  req.originalUrl.startsWith('/auth/') || 
                  req.originalUrl === '/data';
    if (isApi) {
      res.status(401).json({ error: "Unauthorized: Please log in again." });
    } else {
      res.redirect('/login.html');
    }
  }
};
