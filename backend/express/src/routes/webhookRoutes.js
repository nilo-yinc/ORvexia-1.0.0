const express = require('express');
const router = express.Router();
const {webhook} = require('../controllers/webhookController');

router.post('/:slug', webhook);

module.exports = router;