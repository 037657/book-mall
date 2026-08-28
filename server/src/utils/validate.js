const HttpError = require('./httpError');

// 使用 zod 校验，失败时抛出 HttpError(400)
function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const msg = result.error.issues
      .map((i) => `${i.path.length ? i.path.join('.') + ':' : ''}${i.message}`)
      .join('; ');
    throw new HttpError(`参数校验失败: ${msg}`, 400);
  }
  return result.data;
}

module.exports = { validate };
