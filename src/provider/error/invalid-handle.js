class InvalidHandleError extends Error {
  constructor() {
    super('Invalid handle');
  }
}

module.exports = InvalidHandleError;
