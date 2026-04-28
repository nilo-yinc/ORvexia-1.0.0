const Connection = require("../models/Connection");
const CryptoService = require("./CryptoService");

const SECRET_FIELDS = new Set([
  "token",
  "apiKey",
  "webhookUrl",
  "databaseId",
  "calendarId",
  "accessToken",
  "refreshToken",
  "verifyToken",
  "appSecret",
]);

class ConnectionService {
  static async upsert(ownerId, appKey, fields = {}) {
    const encrypted = {};
    const publicFields = {};

    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined) continue;
      if (SECRET_FIELDS.has(key)) encrypted[key] = CryptoService.encrypt(value);
      else publicFields[key] = value;
    }

    const name = publicFields.name || `${appKey} connection`;
    const connection = await Connection.findOneAndUpdate(
      { owner_id: ownerId, appKey },
      {
        owner_id: ownerId,
        appKey,
        name,
        data: encrypted,
        publicData: publicFields,
        verified: true,
        updatedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return connection;
  }

  static async get(ownerId, appKey) {
    const connection = await Connection.findOne({ owner_id: ownerId, appKey });
    if (!connection) return null;

    const secrets = {};
    for (const [key, payload] of Object.entries(connection.data || {})) {
      secrets[key] = CryptoService.decrypt(payload);
    }

    return {
      id: connection._id,
      appKey: connection.appKey,
      name: connection.name,
      verified: connection.verified,
      publicData: connection.publicData || {},
      secrets,
    };
  }

  static async list(ownerId) {
    const connections = await Connection.find({ owner_id: ownerId }).sort({ updatedAt: -1 });
    return connections.map((connection) => ({
      id: connection._id,
      appKey: connection.appKey,
      name: connection.name,
      verified: connection.verified,
      publicData: connection.publicData || {},
      updatedAt: connection.updatedAt,
    }));
  }

  static async listAllByApp(appKey) {
    const connections = await Connection.find({ appKey });
    return connections.map((connection) => ({
      userId: connection.owner_id,
      publicData: connection.publicData || {},
    }));
  }
}

module.exports = ConnectionService;
