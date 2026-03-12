const { logSecurityEvent } = require("../utils/securityLogger");
const logger = require("../utils/logger");

const authorize = (...roles) => {
  return (req, res, next) => {
    logger.info("RBAC middleware called", {
      allowedRoles: roles,
      userRole: req.user ? req.user.role : null,
    });

    if (!req.user || !roles.includes(req.user.role)) {
      logger.error("RBAC — access denied", {
        allowedRoles: roles,
        userRole: req.user ? req.user.role : null,
      });
      logSecurityEvent("forbidden_action", req, {
        allowedRoles: roles,
        userRole: req.user ? req.user.role : null,
      });

      return res.status(403).json({
        success: false,
        message: "Not authorized for this action",
      });
    }

    logger.info("RBAC — access granted", { role: req.user.role });
    next();
  };
};

module.exports = authorize;
