const jwt = require("jsonwebtoken");

const isLoggedInOrQueryToken = (req, res, next) => {
  try {
    let token = req.cookies.jwtToken;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.substring(7);
    }

    // OAuth connect redirects are browser navigations and may not include Authorization header.
    // Allow a short-lived query token fallback for these connect endpoints only.
    if (!token && req.query.token) {
      token = String(req.query.token);
    }

    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized access - No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized access",
      });
    }

    req.user = decoded;
    return next();
  } catch (error) {
    console.error("OAuth connect auth verification failed:", error.message);
    return res.status(401).json({
      status: false,
      message: "Unauthorized access",
    });
  }
};

module.exports = isLoggedInOrQueryToken;
