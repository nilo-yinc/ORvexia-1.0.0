const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/user.models');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_API_KEY || 'rzp_test_SjgALiWCDFMzmo',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '6kz5MYXQKGeQn5WkuIL5MFSz',
});

exports.createOrder = async (req, res) => {
  try {
    const { amount, planId } = req.body;
    
    // Amount is in paise (100 paise = 1 Rupee)
    // Verification charge is 1 Rupee (100 paise)
    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        planId,
        userId: req.user.id,
        type: amount === 1 ? 'TRIAL_VERIFICATION' : 'SUBSCRIPTION_PAYMENT'
      }
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      planId 
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment Verified
      const userId = req.user.id;
      const subscriptionExpiry = new Date();
      subscriptionExpiry.setDate(subscriptionExpiry.getDate() + 30); // 30 days for now

      const user = await User.findByIdAndUpdate(userId, {
        subscription: {
          plan: planId,
          status: 'ACTIVE',
          startDate: new Date(),
          expiryDate: subscriptionExpiry,
          razorpayPaymentId: razorpay_payment_id
        }
      }, { new: true });

      // Send professional notification email
      const { sendSubscriptionEmail } = require('../services/notificationService');
      await sendSubscriptionEmail(user.email, user.name, planId);

      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error('Payment Verification Error:', error);
    res.status(500).json({ error: error.message });
  }
};
