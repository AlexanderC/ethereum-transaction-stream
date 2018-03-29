const { clearInterval, setInterval } = require('timers');
const axios = require('axios');
const debug = require('debug')('ets:ws');
const Connection = require('./connection');
const EtherscanHTTP = require('../http');

class PolyfillConnection extends Connection {
  /**
   * @param {*} args 
   */
  constructor(...args) {
    super(...args);

    this._ticker = null;
    this.lastBlock = EtherscanHTTP.DEFAULT_START_BLOCK;
  }

  /**
   * @inheritDoc
   */
  async connect(context, address) {
    if (!this._ticker) {
      this._ticker = setInterval(async () => {
        await this._tick(context, address);
      }, this.config.wsPoolingInterval);
    }

    return this;
  }

  /**
   * Do a tick
   * @param {Provider} context 
   * @param {string} address 
   */
  async _tick(context, address) {
    const provider = new EtherscanHTTP(this.config);

    await provider.listen(
      address,
      this.lastBlock,
      EtherscanHTTP.DEFAULT_END_BLOCK
    );

    const items = await provider.waitAll();

    if (items.length > 0) {
      if (this.lastBlock) {
        await context.push(...items);
      }

      this.lastBlock = this._getHighestBlock(items) + 1;
    }

    return this;
  }

  /**
   * Get highest block from list of txs
   * @param {Array} items 
   */
  _getHighestBlock(items) {
    if (items.length <= 0) {
      return null;
    }

    const tx = items.sort((a, b) => {
      return parseInt(a.blockNumber) - parseInt(b.blockNumber);
    }).pop();

    return tx ? parseInt(tx.blockNumber) : null;
  }

  /**
   * @inheritDoc
   */
  async close() {
    if (this._ticker) {
      clearInterval(this._ticker);
      this._ticker = null;
    }

    this.lastBlock = EtherscanHTTP.DEFAULT_START_BLOCK;

    return this;
  }
}

module.exports = PolyfillConnection;
