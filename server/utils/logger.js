const fs = require("fs");
const path = require("path");
const loggerConfig = require("../config/loggerConfig");

const logDir = path.resolve(__dirname, "../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFilePath = path.join(logDir, "app.log");

const formatTimestamp = () => new Date().toISOString();

const writeToFile = (entry) => {
  const line = JSON.stringify(entry) + "\n";
  fs.appendFile(logFilePath, line, (err) => {
    if (err) console.error("Failed to write log:", err.message);
  });
};

const buildEntry = (level, message, data) => ({
  timestamp: formatTimestamp(),
  level,
  message,
  ...(data !== undefined && { data }),
});

const logger = {
  /**
   * Log an informational message.
   * Usage: logger.info("Server started", { port: 5000 })
   */
  info: (message, data) => {
    if (!loggerConfig.info) return;
    const entry = buildEntry("INFO", message, data);
    console.log(
      `[${entry.timestamp}] [INFO] ${message}`,
      data !== undefined ? data : "",
    );
    writeToFile(entry);
  },

  /**
   * Log an error message.
   * Usage: logger.error("DB connection failed", { error: err.message })
   */
  error: (message, data) => {
    if (!loggerConfig.error) return;
    const entry = buildEntry("ERROR", message, data);
    console.error(
      `[${entry.timestamp}] [ERROR] ${message}`,
      data !== undefined ? data : "",
    );
    writeToFile(entry);
  },

  /**
   * Log an exception (unhandled / unexpected errors).
   * Usage: logger.exception("Uncaught exception", { stack: err.stack })
   */
  exception: (message, data) => {
    if (!loggerConfig.exception) return;
    const entry = buildEntry("EXCEPTION", message, data);
    console.error(
      `[${entry.timestamp}] [EXCEPTION] ${message}`,
      data !== undefined ? data : "",
    );
    writeToFile(entry);
  },
};

module.exports = logger;
