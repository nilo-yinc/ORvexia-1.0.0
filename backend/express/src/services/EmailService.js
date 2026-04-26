const axios = require('axios');

class EmailService {
  /**
   * Send an automated email via Google Apps Script Webhook
   * @param {string} email - Recipient email
   * @param {string} name - Recipient name
   * @param {string} type - 'welcome', 'otp', 'security', etc.
   * @param {object} payload - Additional dynamic data
   */
  static async send(email, name, type, payload = {}) {
    const webhookUrl = process.env.APPS_SCRIPT_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.warn('[EmailService] APPS_SCRIPT_WEBHOOK_URL not configured. Skipping email.');
      return;
    }

    try {
      const body = { email, name, type, payload };
      console.log(`[EmailService] Sending to GAS:`, JSON.stringify(body));
      
      const response = await axios.post(webhookUrl, JSON.stringify(body), {
        headers: {
          'Content-Type': 'text/plain' 
        }
      });

      // Google Apps Script always returns a 200/302 even if it fails inside
      // So we check the data status if we can
      if (response.data && response.data.status === 'error') {
        console.error(`[EmailService] GAS reported an error:`, response.data.message);
      } else {
        console.log(`[EmailService] SUCCESS: ${type} email dispatched to ${email}`);
      }
    } catch (error) {
      console.error(`[EmailService] CRITICAL FAILURE for ${email}:`, error.message);
      // Detailed error if available
      if (error.response) {
        console.error(`[EmailService] Response status: ${error.response.status}`);
      }
    }
  }
}

module.exports = EmailService;
