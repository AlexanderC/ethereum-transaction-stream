class ProviderContextSetError extends Error {
  constructor() {
    super('Provider context already set');
  }
}

module.exports = ProviderContextSetError;
