class NotConnectedError extends Error {
  constructor() {
    super('Websocket not connected');
  }
}

module.exports = NotConnectedError;
