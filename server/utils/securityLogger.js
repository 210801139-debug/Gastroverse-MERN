const logSecurityEvent = (event, req, details = {}) => {
  const payload = {
    timestamp: new Date().toISOString(),
    event,
    ip: req.ip,
    method: req.method,
    path: req.originalUrl,
    userAgent: req.get("user-agent"),
    userId: req.user ? req.user.id || req.user._id : null,
    ...details,
  };

  console.warn("[SECURITY_EVENT]", JSON.stringify(payload));
};

module.exports = { logSecurityEvent };
