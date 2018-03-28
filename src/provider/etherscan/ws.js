const EtherscanProvider = require('./provider');
const ConnectionFactory = require('./ws/factory');

class EtherscanWS extends EtherscanProvider {
  /**
   * @param {*} args 
   */
  constructor(...args) {
    super(...args);

    this.connection = ConnectionFactory.create(this.config);
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

    return super.close();
  }
}

module.exports = EtherscanWS;
