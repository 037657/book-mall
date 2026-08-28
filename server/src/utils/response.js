// 统一响应格式 { code, message, data }，code = 0 表示成功
function ok(res, data = null, message = 'ok') {
  res.json({ code: 0, message, data });
}

function fail(res, message = '请求失败', code = 1, status = 400) {
  res.status(status).json({ code, message, data: null });
}

module.exports = { ok, fail };
