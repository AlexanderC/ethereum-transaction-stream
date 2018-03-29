const EtherscanProvider = require('./provider');
const ConnectionFactory = require('./ws/factory');

class EtherscanWS extends EtherscanProvider {
  /**
   * @param {*} args 
   */
  constructor(...args) {
    super(...args);

    this._connection = null;
  }

  /**
   * @param {string} address
   */
  async start(address) {
    await this.connection.connect(this, address);

    return this;
  }

  /**
   * @inheritDoc
   */
  async close() {
    await this.connection.close();
    
    this._connection = null;

    return super.close();
  }

  /**
   * Get ws connection
   */
  get connection() {
    if (!this._connection) {
      this._connection = ConnectionFactory.create(this.config);
    }

    return this._connection;
  }
}

module.exports = EtherscanWS;
