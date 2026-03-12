const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { logSecurityEvent } = require("../utils/securityLogger");
const logger = require("../utils/logger");

const protect = async (req, res, next) => {
  try {
    logger.info("Auth middleware called", {
      method: req.method,
      url: req.originalUrl,
    });

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.error("Auth — missing or invalid authorization header", {
        authHeader: authHeader ? "present but malformed" : "missing",
      });
      logSecurityEvent("missing_or_invalid_auth_header", req);
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: process.env.JWT_ISSUER || "gastroverse-api",
      audience: process.env.JWT_AUDIENCE || "gastroverse-client",
    });
    const user = await User.findById(decoded.id);

    if (!user) {
      logger.error("Auth — user not found for decoded token", {
        decodedId: decoded.id,
      });
      logSecurityEvent("auth_user_not_found", req);
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    logger.info("Auth — user authenticated", {
      userId: user._id,
      role: user.role,
    });
    req.user = user;
    next();
  } catch (error) {
    logger.exception("Auth middleware threw an exception", {
      error: error.message,
      stack: error.stack,
    });
    logSecurityEvent("token_verification_failed", req, {
      errorName: error.name,
    });
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
};

module.exports = protect;
