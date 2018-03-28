const NativeConnection = require('./native');
const MockConnection = require('./mock');

class Factory {
  /**
   * Creates a new instance of connection
   * @param {Config} config 
   */
  static create(config) {
    if (config.wsURL && NativeConnection.isSupported) {
      return new NativeConnection(config);
    }

    return new MockConnection(config);
  }
}

module.exports = Factory;
