function firstHeaderValue(value) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function getClientIp(req) {
  const forwardedFor = firstHeaderValue(req.headers["x-forwarded-for"]);
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  return req.ip || req.socket?.remoteAddress || "Unknown";
}

function getLocation(req) {
  const city = firstHeaderValue(req.headers["x-vercel-ip-city"]);
  const region = firstHeaderValue(req.headers["x-vercel-ip-country-region"]);
  const country =
    firstHeaderValue(req.headers["x-vercel-ip-country"]) ||
    firstHeaderValue(req.headers["cf-ipcountry"]);

  return [city, region, country].filter(Boolean).join(", ") || "Approximate location unavailable";
}

function getRequestContext(req) {
  return {
    ip: getClientIp(req),
    location: getLocation(req),
    device: firstHeaderValue(req.headers["user-agent"]) || "Unknown device",
    time: new Date().toISOString(),
    appUrl: process.env.CLIENT_URL || "https://orvexiaaiautomation.vercel.app",
  };
}

function buildSecurityPayload(req, method, extra = {}) {
  return {
    ...getRequestContext(req),
    method,
    ...extra,
  };
}

module.exports = {
  buildSecurityPayload,
  getRequestContext,
};
