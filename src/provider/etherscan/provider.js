const debug = require('debug')('ets:provider');
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

  /**
   * @inheritDoc
   */
  async onContext() {
    if (this.config.includeInternal) {
      this.middleware.register(async (item) => {
        const { url, method, params, data } = this.config.listInternalTx(item);
      
        const response = await this.rawRequest(
          url, method, params, data
        );

        item[EtherscanProvider.INTERNAL_TXS_KEY] = response.data.result || [];

        debug(
          'internal items',
          item[EtherscanProvider.INTERNAL_TXS_KEY]
            ? item[EtherscanProvider.INTERNAL_TXS_KEY].length
            : 0
        );
  
        return item;
      });
    }
  }

  /**
   * Internal transactions key
   */
  static get INTERNAL_TXS_KEY() {
    return '$internal';
  }
}

module.exports = EtherscanProvider;
