const db = require('../db');

// 记录关键操作日志
function logOperation(userId, action, detail) {
  try {
    db.prepare('INSERT INTO logs (user_id, action, detail) VALUES (?, ?, ?)').run(
      userId || null,
      action,
      detail || ''
    );
  } catch (e) {
    console.error('[log] 记录日志失败:', e.message);
  }
}

// 简单的请求日志中间件
function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });
  next();
}

module.exports = { logOperation, requestLogger };
