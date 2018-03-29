const NativeConnection = require('./native');
const PolyfillConnection = require('./polyfill');

class Factory {
  /**
   * Creates a new instance of connection
   * @param {Config} config 
   */
  static create(config) {
    if (config.wsURL && NativeConnection.isSupported) {
      return new NativeConnection(config);
    }

    return new PolyfillConnection(config);
  }
}

module.exports = Factory;
