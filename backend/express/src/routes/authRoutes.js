const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const EmailService = require('../services/EmailService');
const { buildSecurityPayload } = require('../utils/requestContext');
const router = express.Router();
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

// Initiate GitHub Login
router.get('/github', (req, res, next) => {
  const host = req.get('host');
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const callbackURL = `${protocol}://${host}/api/v1/auth/github/callback`;
  
  console.log(`[GitHubOAuth] Initiating login. Host: ${host}, Protocol: ${protocol}, Callback: ${callbackURL}`);

  passport.authenticate('github', { 
    scope: [ 'user:email' ],
    callbackURL
  })(req, res, next);
});

// GitHub Callback
router.get('/github/callback', (req, res, next) => {
  const host = req.get('host');
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const callbackURL = `${protocol}://${host}/api/v1/auth/github/callback`;

  passport.authenticate('github', { 
    callbackURL,
    failureRedirect: `${clientUrl}/login?error=auth_failed` 
  })(req, res, (err) => {
    if (err) {
      console.error('[GitHubOAuth] Authentication Error:', err);
      return res.status(500).json({ error: 'Authentication failed', details: err.message, stack: err.stack });
    }
    next();
  });
}, async function(req, res) {
  try {
    // Generate JWT for the OAuth user
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: process.env.JWT_EXPIRY || '24h',
    });
    
    // Send welcome email
    try {
      EmailService.send(req.user.email, req.user.name, 'security', buildSecurityPayload(req, 'GitHub OAuth'));
    } catch (e) {
      console.error('[GitHubOAuth] Email notification failed:', e);
    }
    
    // Redirect with token
    res.redirect(`${clientUrl}/auth-callback?token=${token}`);
  } catch (err) {
    console.error('[GitHubOAuth] Callback Handler Error:', err);
    res.status(500).json({ error: 'Callback handler failed', details: err.message, stack: err.stack });
  }
});

const googleScopes = [
  'profile',
  'email',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/calendar.freebusy',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/documents',
];

const normalizeRedirectPath = (value) => {
  if (!value || typeof value !== "string") return "";
  if (!value.startsWith("/")) return "";
  if (value.startsWith("//")) return "";
  return value;
};

// Initiate Google Login
router.get('/google', (req, res, next) => {
  const redirectPath = normalizeRedirectPath(req.query.redirect);
  const host = req.get('host');
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const callbackURL = `${protocol}://${host}/api/v1/auth/google/callback`;
  
  console.log(`[GoogleOAuth] Initiating login. Host: ${host}, Protocol: ${protocol}, Callback: ${callbackURL}`);

  passport.authenticate('google', {
    scope: googleScopes,
    accessType: 'offline',
    prompt: 'consent',
    state: redirectPath ? encodeURIComponent(redirectPath) : undefined,
    callbackURL
  })(req, res, next);
});

// Google Callback
router.get('/google/callback', (req, res, next) => {
  const host = req.get('host');
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const callbackURL = `${protocol}://${host}/api/v1/auth/google/callback`;

  passport.authenticate('google', { 
    callbackURL,
    failureRedirect: `${clientUrl}/login?error=auth_failed` 
  })(req, res, (err) => {
    if (err) {
      console.error('[GoogleOAuth] Authentication Error:', err);
      return res.status(500).json({ error: 'Authentication failed', details: err.message, stack: err.stack });
    }
    next();
  });
}, async function(req, res) {
  try {
    // Generate JWT for the OAuth user
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: process.env.JWT_EXPIRY || '24h',
    });
    
    // Send security alert email
    try {
      EmailService.send(req.user.email, req.user.name, 'security', buildSecurityPayload(req, 'Google OAuth'));
    } catch (e) {
      console.error('[GoogleOAuth] Email notification failed:', e);
    }
    
    const redirectPath = normalizeRedirectPath(req.query.state ? decodeURIComponent(req.query.state) : "");
    const redirectQuery = redirectPath ? `&redirect=${encodeURIComponent(redirectPath)}` : "";
    res.redirect(`${clientUrl}/auth-callback?token=${token}${redirectQuery}`);
  } catch (err) {
    console.error('[GoogleOAuth] Callback Handler Error:', err);
    res.status(500).json({ error: 'Callback handler failed', details: err.message, stack: err.stack });
  }
});

const isLoggedIn = require('../middlewares/isLoggedIn.middleware');

// Get current user session (works for both session-based and JWT)
router.get('/me', isLoggedIn, (req, res) => {
    res.json({ success: true, user: req.user });
});

// Logout
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

module.exports = router;
