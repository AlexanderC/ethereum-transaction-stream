class MissingProviderContextError extends Error {
  constructor() {
    super('Missing provider context');
  }
}

module.exports = MissingProviderContextError;
