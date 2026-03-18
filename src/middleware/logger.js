const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../../logs/logs.txt');

// Ensure the log file exists
if (!fs.existsSync(logFilePath)) {
  fs.writeFileSync(logFilePath, '--- Task Manager API Logs ---\n');
}

/**
 * Express middleware: logs every incoming request to logs.txt
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    const log = `[${timestamp}] REQUEST | ${req.method} ${req.originalUrl} | status=${res.statusCode} | ${duration}ms\n`;

    // Write to file (non-blocking)
    fs.appendFile(logFilePath, log, (err) => {
      if (err) console.error('[Logger] Failed to write log:', err.message);
    });

    // Also print to console for visibility
    console.log(`[Request] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
  });

  next();
};

module.exports = requestLogger;
