const { logSecurityEvent } = require("../utils/securityLogger");

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      logSecurityEvent("forbidden_action", req, {
        allowedRoles: roles,
        userRole: req.user ? req.user.role : null,
      });

      return res.status(403).json({
        success: false,
        message: "Not authorized for this action",
      });
    }
    next();
  };
};

module.exports = authorize;
