const axios = require("axios");
const User = require("../models/user.models");
require("../config/loadEnv");

class GoogleService {
  static async getAccessToken(ownerId) {
    const user = await User.findById(ownerId);
    if (!user?.googleAccessToken) {
      throw new Error("Google permission needed. Reconnect Google from the login screen to enable Calendar, Meet, Drive, and Docs.");
    }
    return { user, accessToken: user.googleAccessToken };
  }

  static async refreshAccessToken(user) {
    if (!user.googleRefreshToken) return null;
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return null;

    const response = await axios.post("https://oauth2.googleapis.com/token", new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: user.googleRefreshToken,
      grant_type: "refresh_token",
    }).toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    user.googleAccessToken = response.data.access_token;
    await user.save();
    return user.googleAccessToken;
  }

  static async request(ownerId, options) {
    const { user, accessToken } = await this.getAccessToken(ownerId);

    try {
      return await axios.request({
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      if (error.response?.status === 401) {
        const refreshed = await this.refreshAccessToken(user);
        if (refreshed) {
          return axios.request({
            ...options,
            headers: {
              ...(options.headers || {}),
              Authorization: `Bearer ${refreshed}`,
            },
          });
        }
      }
      throw error;
    }
  }
}

module.exports = GoogleService;
