const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../../logs/logs.txt');

fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
if (!fs.existsSync(logFilePath)) {
  fs.writeFileSync(logFilePath, '--- Task Manager Logs ---\n');
}

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    const log = `[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms\n`;

    fs.appendFile(logFilePath, log, (err) => {
      if (err) console.error('Logger write failed:', err.message);
    });

    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
  });

  next();
};

module.exports = requestLogger;
