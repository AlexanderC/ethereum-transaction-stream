const NotImplementedError = require('./error/not-implemented');

class Connection {
  /**
   * @param {Config} config 
   */
  constructor(config) {
    this.config = config;
  }

  /**
   * Starts conn
   * @param {Provider} context 
   * @param {string} address
   */
  async connect(context, address) {
    throw new NotImplementedError();
  }

  /**
   * Close connection
   */
  async close() {
    throw new NotImplementedError();
  }

  /**
   * Get websocket ping interval
   */
  get pingInterval() {
    return this.config.wsPingInterval;
  }

  /**
   * Get websocket url
   */
  get url() {
    return this.config.wsURL;
  }
}

module.exports = Connection;
