const { fail } = require('../utils/response');

function notFound(req, res) {
  fail(res, '接口不存在', 404, 404);
}

// 统一错误处理
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const code = err.code || status;
  if (status >= 500) {
    console.error('[error]', err);
  }
  return fail(res, err.message || '服务器内部错误', code, status);
}

module.exports = { notFound, errorHandler };
