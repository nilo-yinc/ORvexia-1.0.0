const express = require('express');
const router = express.Router();
const { architect, getConversation, saveConversation } = require('../controllers/aiController');
const isLoggedIn = require('../middlewares/isLoggedIn.middleware');

router.post('/architect', isLoggedIn, architect);
router.get('/conversation/:workflowId', isLoggedIn, getConversation);
router.put('/conversation/:workflowId', isLoggedIn, saveConversation);

module.exports = router;
