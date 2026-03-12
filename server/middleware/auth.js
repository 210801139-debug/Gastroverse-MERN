const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { logSecurityEvent } = require("../utils/securityLogger");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
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
      logSecurityEvent("auth_user_not_found", req);
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    logSecurityEvent("token_verification_failed", req, {
      errorName: error.name,
    });
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
};

module.exports = protect;
