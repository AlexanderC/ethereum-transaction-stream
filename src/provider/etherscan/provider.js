const HTTP = require('../http');
const Config = require('./config');

class EtherscanProvider extends HTTP {
  /**
   * Creates a new Etherscan client
   * @param {string} network 
   * @param {string} apiKey 
   */
  static create(network = Config.MAINNET, apiKey = Config.DEFAULT_API_KEY) {
    return new this(new Config(network, apiKey));
  }
}

module.exports = EtherscanProvider;
