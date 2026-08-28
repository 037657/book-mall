const jwt = require('jsonwebtoken');
const config = require('../config');
const { fail } = require('../utils/response');

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return fail(res, '未登录', 401, 401);
  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch (e) {
    return fail(res, '登录已过期，请重新登录', 401, 401);
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return fail(res, '无权限访问', 403, 403);
  }
  next();
}

module.exports = { auth, adminOnly };
