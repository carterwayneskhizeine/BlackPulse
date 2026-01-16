/**
 * @file Invitation Middleware
 * @description Middleware to check if user has verified invitation code
 */

const INVITATION_MODE = process.env.INVITATION_MODE === 'true';
const INVITATION_CODE = process.env.INVITATION_CODE;

/**
 * Middleware to check if user has verified invitation code
 * If not verified, redirects to invitation verification page
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const requireInvitation = (req, res, next) => {
    // Check if invitation mode is enabled
    if (!INVITATION_MODE) {
        // Invitation mode is disabled, proceed normally
        return next();
    }

    // Check if user has already verified invitation code
    if (req.session && req.session.invitationVerified) {
        return next();
    }

    // Build redirect URL with original query parameters
    const originalUrl = req.originalUrl || req.url;
    const redirectParam = encodeURIComponent(originalUrl);

    // Redirect to invitation verification page
    // Exclude API routes and static assets from invitation check
    if (req.path.startsWith('/api/') || req.path.startsWith('/js/') || req.path.startsWith('/style.css')) {
        return next();
    }

    res.redirect(`/invite?redirect=${redirectParam}`);
};

/**
 * Verify invitation code
 * @param {string} code - The invitation code to verify
 * @returns {boolean} - True if code is valid
 */
const verifyInvitationCode = (code) => {
    return code === INVITATION_CODE;
};

module.exports = {
    requireInvitation,
    verifyInvitationCode
};
