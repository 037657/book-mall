class HttpError extends Error {
  constructor(message, status = 400, code = status) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

module.exports = HttpError;
