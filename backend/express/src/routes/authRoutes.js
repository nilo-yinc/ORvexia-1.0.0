const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const EmailService = require('../services/EmailService');
const router = express.Router();

// Initiate GitHub Login
router.get('/github', passport.authenticate('github', { scope: [ 'user:email' ] }));

// GitHub Callback
router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: 'http://localhost:5173/login?error=auth_failed' }),
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
    res.redirect(`http://localhost:5173/auth-callback?token=${token}`);
  }
);

// Initiate Google Login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login?error=auth_failed' }),
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
    
    // Redirect with token
    res.redirect(`http://localhost:5173/auth-callback?token=${token}`);
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
