const express = require('express');
const router = express.Router();
const { verifyInvitationCode } = require('../middleware/invite');

/**
 * @description Invitation verification routes
 * @returns {express.Router}
 */
module.exports = function() {
  // GET /invite - Show invitation verification page
  router.get('/', (req, res) => {
    // If already verified, redirect to home or the intended destination
    if (req.session && req.session.invitationVerified) {
      const redirectTo = req.query.redirect || '/';
      return res.redirect(redirectTo);
    }

    // Render invitation verification page
    res.render('invite', {
      redirectTo: req.query.redirect || '/'
    });
  });

  // POST /api/invite/verify - Verify invitation code
  router.post('/verify', (req, res) => {
    const { code } = req.body;

    // Input validation
    if (!code) {
      return res.status(400).json({ error: 'Invitation code is required' });
    }

    // Verify the code
    if (verifyInvitationCode(code)) {
      // Mark session as verified
      req.session.invitationVerified = true;
      req.session.invitationVerifiedAt = new Date().toISOString();

      // Get redirect URL from query parameter or default to root
      const redirectTo = req.query.redirect || req.body.redirect || '/';

      return res.json({
        message: 'Invitation code verified successfully',
        redirectTo
      });
    } else {
      return res.status(401).json({ error: 'Invalid invitation code' });
    }
  });

  return router;
};
