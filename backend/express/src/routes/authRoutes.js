const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const EmailService = require('../services/EmailService');
const router = express.Router();
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

// Initiate GitHub Login
router.get('/github', passport.authenticate('github', { scope: [ 'user:email' ] }));

// GitHub Callback
router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: `${clientUrl}/login?error=auth_failed` }),
  function(req, res) {
    // Generate JWT for the OAuth user so the frontend can persist the session
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY || '24h',
    });
    
    // Send welcome email for new users (fire and forget)
    EmailService.send(req.user.email, req.user.name, 'security', { 
      ip: req.ip || 'Unknown', 
      method: 'GitHub OAuth' 
    });
    
    // Redirect with token so the frontend can store it
    res.redirect(`${clientUrl}/auth-callback?token=${token}`);
  }
);

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
  passport.authenticate('google', {
    scope: googleScopes,
    accessType: 'offline',
    prompt: 'consent',
    state: redirectPath ? encodeURIComponent(redirectPath) : undefined,
  })(req, res, next);
});

// Google Callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: `${clientUrl}/login?error=auth_failed` }),
  function(req, res) {
    // Generate JWT for the OAuth user
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY || '24h',
    });
    
    // Send security alert email
    EmailService.send(req.user.email, req.user.name, 'security', { 
      ip: req.ip || 'Unknown', 
      method: 'Google OAuth' 
    });
    
    const redirectPath = normalizeRedirectPath(req.query.state ? decodeURIComponent(req.query.state) : "");
    const redirectQuery = redirectPath ? `&redirect=${encodeURIComponent(redirectPath)}` : "";
    res.redirect(`${clientUrl}/auth-callback?token=${token}${redirectQuery}`);
  }
);

// Get current user session (works for both session-based and JWT)
router.get('/me', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ success: true, user: req.user });
    } else {
        res.status(401).json({ success: false, message: 'Not authenticated' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

module.exports = router;
