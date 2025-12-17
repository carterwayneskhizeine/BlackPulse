/**
 * @file Auth Middleware
 * @description Authentication and user session middleware for Express.
 */

/**
 * Middleware to ensure the user is authenticated.
 * If not authenticated, it sends a 401 Unauthorized response.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
};

/**
 * Creates a middleware function that retrieves the current user's information
 * from the session and attaches it to the request object (`req.userId`, `req.username`, `req.isAdmin`).
 * @param {import('sqlite3').Database} db - The database instance.
 * @returns {import('express').Handler} An Express middleware handler.
 */
const createGetCurrentUserMiddleware = (db) => {
  return (req, res, next) => {
    if (req.session && req.session.userId) {
      req.userId = req.session.userId;
      req.username = req.session.username;

      // Get user's admin status from the database
      db.get('SELECT is_admin FROM users WHERE id = ?', [req.session.userId], (err, user) => {
        if (err) {
          // Log the error but don't block the request, just proceed without admin status
          console.error('Error checking user admin status:', err);
        } else if (user) {
          req.isAdmin = user.is_admin === 1;
        }
        next();
      });
    } else {
      // Not logged in, just continue
      next();
    }
  };
};

module.exports = {
  requireAuth,
  createGetCurrentUserMiddleware,
};
