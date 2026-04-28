/**
 * Slack Message Poller
 * Polls Slack for new messages every 5 seconds and triggers workflows.
 * This bypasses the need for Event Subscriptions/webhooks.
 */
const axios = require('axios');

class SlackPoller {
  constructor(botToken, channelId, onMessage) {
    this.botToken = botToken;
    this.channelId = channelId;
    this.onMessage = onMessage;
    this.lastTs = String(Date.now() / 1000); // Start from now
    this.interval = null;
    this.botUserId = null;
  }

  async start(pollIntervalMs = 5000) {
    // Get bot user ID to filter out own messages
    try {
      const authRes = await axios.get('https://slack.com/api/auth.test', {
        headers: { Authorization: `Bearer ${this.botToken}` }
      });
      if (authRes.data.ok) {
        this.botUserId = authRes.data.user_id;
        console.log('[SlackPoller] Bot user ID:', this.botUserId);
      } else {
        console.error('[SlackPoller] auth.test failed:', authRes.data.error);
        return;
      }
    } catch (e) {
      console.error('[SlackPoller] Failed to get bot identity:', e.message);
      return;
    }

    console.log(`[SlackPoller] Polling channel ${this.channelId} every ${pollIntervalMs}ms`);
    this.interval = setInterval(() => this.poll(), pollIntervalMs);
    this.poll(); // Immediate first poll
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
  }

  async poll() {
    try {
      const res = await axios.get('https://slack.com/api/conversations.history', {
        headers: { Authorization: `Bearer ${this.botToken}` },
        params: {
          channel: this.channelId,
          oldest: this.lastTs,
          limit: 10,
          inclusive: false
        }
      });

      if (!res.data.ok) {
        console.error('[SlackPoller] API error:', res.data.error);
        return;
      }

      const messages = (res.data.messages || [])
        .filter(m => !m.bot_id && m.user !== this.botUserId && !m.subtype)
        .reverse(); // oldest first

      for (const msg of messages) {
        console.log(`[SlackPoller] New message: "${msg.text}" from ${msg.user}`);
        this.lastTs = msg.ts;
        
        try {
          await this.onMessage({
            type: 'message',
            text: msg.text,
            user: msg.user,
            channel: this.channelId,
            ts: msg.ts
          });
        } catch (e) {
          console.error('[SlackPoller] Error handling message:', e.message);
        }
      }

      // Update timestamp even if no messages
      if (messages.length > 0) {
        this.lastTs = messages[messages.length - 1].ts;
      }
    } catch (e) {
      console.error('[SlackPoller] Poll error:', e.message);
    }
  }
}

module.exports = SlackPoller;
