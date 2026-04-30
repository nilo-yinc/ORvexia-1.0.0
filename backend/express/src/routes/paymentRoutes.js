const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/razorpayController');
const isLoggedIn = require('../middlewares/isLoggedIn.middleware');

router.post('/order', isLoggedIn, createOrder);
router.post('/verify', isLoggedIn, verifyPayment);

module.exports = router;
