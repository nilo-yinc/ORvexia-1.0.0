const crypto = require("crypto");
require("../config/loadEnv");

const algorithm = "aes-256-gcm";

const getKey = () => {
  const source = process.env.ENV_ENCRYPTION_KEY || process.env.JWT_SECRET || "orvexia_local_dev_key";
  return crypto.createHash("sha256").update(source).digest();
};

class CryptoService {
  static encrypt(value) {
    if (value === undefined || value === null || value === "") return null;
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(algorithm, getKey(), iv);
    const encrypted = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
      value: encrypted.toString("base64"),
      iv: iv.toString("base64"),
      tag: tag.toString("base64"),
    };
  }

  static decrypt(payload) {
    if (!payload || !payload.value || !payload.iv || !payload.tag) return null;
    const decipher = crypto.createDecipheriv(
      algorithm,
      getKey(),
      Buffer.from(payload.iv, "base64")
    );
    decipher.setAuthTag(Buffer.from(payload.tag, "base64"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(payload.value, "base64")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  }
}

module.exports = CryptoService;
