const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendSubscriptionEmail = async (userEmail, userName, planName) => {
  const mailOptions = {
    from: `"ORvexia Infrastructure" <${process.env.MAIL_USER}>`,
    to: userEmail,
    subject: `[SYSTEM_NOTIFICATION] ${planName} Plan Activation Success`,
    html: `
      <div style="background-color: #030303; color: #ffffff; padding: 40px; font-family: 'Inter', sans-serif;">
        <h1 style="color: #FF5F1F; font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase;">ORvexia Core Infrastructure</h1>
        <hr style="border-color: #1a1a1a;" />
        <p style="font-size: 14px; line-height: 1.6; color: #888;">Greetings, ${userName},</p>
        <p style="font-size: 16px; font-weight: bold; color: #fff;">Your ${planName} subscription has been successfully deployed.</p>
        <div style="background: #0a0a0a; border: 1px solid #FF5F1F40; padding: 20px; border-radius: 8px; margin: 20px 0;">
           <p style="margin: 0; font-size: 12px; color: #FF5F1F; font-weight: 900; letter-spacing: 2px;">TRIAL ACTIVATED: 14 DAYS</p>
           <p style="margin: 5px 0 0 0; font-size: 11px; color: #444;">System will automatically notify you 48 hours before trial expiration.</p>
        </div>
        <p style="font-size: 13px; color: #666;">Access your advanced architecture nodes now at: <a href="https://orvexiaiaautomation.vercel.app/home" style="color: #FF5F1F;">System Dashboard</a></p>
        <br />
        <p style="font-size: 10px; color: #333; text-transform: uppercase; letter-spacing: 2px;">SECURITY_TOKEN: ${Math.random().toString(36).substring(7).toUpperCase()}</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Subscription email sent to:', userEmail);
  } catch (error) {
    console.error('Email Error:', error);
  }
};

module.exports = { sendSubscriptionEmail };
