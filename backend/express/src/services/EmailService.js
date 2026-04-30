const axios = require('axios');
require('../config/loadEnv');
const nodemailer = require('nodemailer');

const EMAIL_TYPES = new Set([
  'otp',
  'welcome',
  'security',
  'automation_success',
  'automation_fail',
  'custom',
  'system',
  'marketing'
]);

class EmailService {
  /**
   * Send email through Google Apps Script first, then Gmail SMTP as a fallback.
   */
  static async send(email, name, type, payload = {}) {
    const normalizedType = EMAIL_TYPES.has(type) ? type : 'system';
    const enrichedPayload = {
      platform: 'ORVEXIA',
      appUrl: process.env.CLIENT_URL || 'https://orvexiaaiautomation.vercel.app',
      ...payload,
    };

    const scriptResult = await sendViaAppsScript(email, name, normalizedType, enrichedPayload);
    if (scriptResult.ok) return scriptResult;

    if (process.env.APPS_SCRIPT_WEBHOOK_URL) {
      console.warn(`[EmailService] Apps Script failed, falling back to SMTP: ${scriptResult.message}`);
    }

    return sendViaSmtp(email, name, normalizedType, enrichedPayload);
  }
}

async function sendViaAppsScript(email, name, type, payload) {
  const webhookUrl = process.env.APPS_SCRIPT_WEBHOOK_URL;
  if (!webhookUrl) {
    return { ok: false, skipped: true, provider: 'apps_script', message: 'APPS_SCRIPT_WEBHOOK_URL missing' };
  }

  try {
    const response = await axios.post(
      webhookUrl,
      {
        secret: process.env.MAIL_WEBHOOK_SECRET || '',
        email,
        name,
        type,
        payload,
      },
      {
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (response.data?.status === 'success') {
      console.log(`[EmailService] Apps Script sent ${type} email to ${email}`);
      return { ok: true, provider: 'apps_script', response: response.data };
    }

    return {
      ok: false,
      provider: 'apps_script',
      message: response.data?.message || 'Apps Script returned a non-success response',
    };
  } catch (error) {
    return {
      ok: false,
      provider: 'apps_script',
      message: getAxiosErrorMessage(error),
    };
  }
}

async function sendViaSmtp(email, name, type, payload) {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
      console.warn('[EmailService] EMAIL_USER or EMAIL_PASS not configured. Skipping email.');
      return { ok: false, skipped: true, message: 'SMTP credentials missing' };
    }

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
      });

    const subject = buildSubject(type, payload);
    const text = payload.message || payload.body || `Notification from ORVEXIA. Type: ${type}`;

      const mailOptions = {
        from: `"ORVEXIA" <${user}>`,
        to: email,
        subject,
        text,
      html: buildFallbackHtml(name, type, payload, text),
      };

    console.log(`[EmailService] Sending SMTP ${type} email to ${email}...`);
      const info = await transporter.sendMail(mailOptions);
      console.log(`[EmailService] SUCCESS: Message sent: ${info.messageId}`);
      
    return { ok: true, provider: 'smtp', messageId: info.messageId };
    } catch (error) {
      console.error(`[EmailService] SMTP FAILURE:`, error.message);
    return { ok: false, provider: 'smtp', message: error.message };
    }
}

function buildSubject(type, payload) {
  if (payload.subject) return payload.subject;

  switch (type) {
    case 'otp':
      return `${payload.otp} is your ORVEXIA verification code`;
    case 'welcome':
      return 'Welcome to ORVEXIA';
    case 'security':
      return 'ORVEXIA security alert: new authorization';
    case 'automation_success':
      return `ORVEXIA workflow completed: ${payload.workflowName || 'Task completed'}`;
    case 'automation_fail':
      return `ORVEXIA workflow needs attention: ${payload.workflowName || 'Task failed'}`;
    case 'marketing':
      return 'Put ORVEXIA automation to work';
    default:
      return 'ORVEXIA system notification';
  }
}

function buildFallbackHtml(name, type, payload, text) {
  const rows = [
    payload.method && ['Method', payload.method],
    payload.ip && ['IP address', payload.ip],
    payload.location && ['Location', payload.location],
    payload.device && ['Device', payload.device],
    payload.time && ['Time', payload.time],
  ].filter(Boolean);

  const detailRows = rows.map(([label, value]) => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #27272a;color:#a1a1aa;">${escapeHtml(label)}</td>
      <td style="padding:10px;border-bottom:1px solid #27272a;color:#ffffff;">${escapeHtml(value)}</td>
    </tr>
  `).join('');

  const otpBlock = type === 'otp'
    ? `<div style="font-size:42px;letter-spacing:10px;color:#ff5f1f;font-weight:800;margin:20px 0;">${escapeHtml(payload.otp || '')}</div>`
    : '';

  return `<div style="margin:0;padding:32px;background:#030303;color:#ffffff;font-family:Arial,sans-serif;">
    <div style="max-width:640px;margin:0 auto;background:#111113;border:1px solid #2b2b30;">
      <div style="padding:26px 30px;border-bottom:1px solid #2b2b30;">
        <div style="font-size:22px;font-weight:900;letter-spacing:.5px;">ORV<span style="color:#ff5f1f;">EXIA</span></div>
        <div style="margin-top:8px;color:#a1a1aa;font-size:13px;">Agentic workflow automation platform</div>
      </div>
      <div style="padding:30px;">
        <p style="color:#a1a1aa;margin:0 0 12px;">Hello ${escapeHtml(name || 'Operator')},</p>
        ${otpBlock}
        <p style="font-size:16px;line-height:1.6;margin:0 0 18px;">${escapeHtml(text)}</p>
        ${detailRows ? `<table style="width:100%;border-collapse:collapse;background:#18181b;margin-top:22px;">${detailRows}</table>` : ''}
      </div>
      <div style="padding:18px 30px;color:#71717a;font-size:12px;border-top:1px solid #2b2b30;">
        Sent by ORVEXIA. If this was not you, secure your account immediately.
      </div>
    </div>
  </div>`;
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getAxiosErrorMessage(error) {
  if (error.response?.data) {
    const data = typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data);
    return `${error.message}: ${data.slice(0, 300)}`;
  }

  return error.message;
}

module.exports = EmailService;
