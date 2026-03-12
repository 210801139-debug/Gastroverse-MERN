const { logSecurityEvent } = require("../utils/securityLogger");
const logger = require("../utils/logger");

const notFound = (req, res) => {
  logger.error("Route not found", { method: req.method, url: req.originalUrl });
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};

const errorHandler = (err, req, res, _next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Internal Server Error";

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier";
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((value) => value.message)
      .join(", ");
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Not authorized";
  }

  if (statusCode >= 500) {
    logger.exception("Server error handled", {
      statusCode,
      errorName: err.name,
      message: err.message,
      stack: err.stack,
    });
    logSecurityEvent("server_error", req, {
      statusCode,
      errorName: err.name,
    });
  } else {
    logger.error("Client error handled", {
      statusCode,
      errorName: err.name,
      message,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = { notFound, errorHandler };
