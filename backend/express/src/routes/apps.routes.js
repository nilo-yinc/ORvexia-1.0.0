const express = require('express');
const router = express.Router();
const appsController = require('../controllers/apps.controller');
const isLoggedIn = require('../middlewares/isLoggedIn.middleware');
const isLoggedInOrQueryToken = require('../middlewares/isLoggedInOrQueryToken.middleware');

router.get('/', isLoggedIn, appsController.listApps);
router.get('/connections', isLoggedIn, appsController.listConnections);
router.get('/slack/connect', isLoggedInOrQueryToken, appsController.connectSlackOAuth);
router.get('/slack/callback', appsController.handleSlackOAuthCallback);
router.get('/notion/connect', isLoggedInOrQueryToken, appsController.connectNotionOAuth);
router.get('/notion/callback', appsController.handleNotionOAuthCallback);
router.get('/github/connect', isLoggedInOrQueryToken, appsController.connectGitHubOAuth);
router.get('/github/callback', appsController.handleGitHubOAuthCallback);
router.post('/slack/events', appsController.handleSlackEvents);
router.get('/:appKey', isLoggedIn, appsController.getApp);
router.post('/:appKey/connection', isLoggedIn, appsController.saveConnection);

module.exports = router;
