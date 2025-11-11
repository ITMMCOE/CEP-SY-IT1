const path = require('path');
const express = require('express');
require('dotenv').config();
const rateLimiter = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    logger.info(`${req.ip} ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });
  next();
});

// Apply rate limiter
app.use(rateLimiter());

// Serve static from project root
app.use(express.static(path.resolve(__dirname)));

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});
