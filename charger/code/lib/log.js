const winston = require('winston');
require('winston-daily-rotate-file');
const config = require('../config.json');
const fs = require('fs');
const path = require('path');


// Ensure the directory exists
const ensureDirectoryExistence = (filePath) => {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  fs.mkdirSync(dirname, { recursive: true });
};

const fileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(__dirname, 'log', `${config.M1.identity}-%DATE%.log`),
  datePattern: 'YYYY-MM-DD_HH',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '24h',
  frequency: '1h',
});

const timezoned = () => {
  return new Date().toLocaleString('en-US', {
  });
};

ensureDirectoryExistence(fileTransport.filename);

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: timezoned }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    fileTransport
  ]
});

module.exports = { logger }