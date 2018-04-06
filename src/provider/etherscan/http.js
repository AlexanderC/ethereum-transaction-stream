const debug = require('debug')('ets:provider');
const EtherscanProvider = require('./provider');

class EtherscanHTTP extends EtherscanProvider {
  /**
   * @param {string} address
   * @param {number} startblock
   * @param {number} endblock
   * @param {string} ERC20TokenAddress
   * @param {boolean} mintOnly
   */
  async start(
    address,
    startblock = EtherscanHTTP.DEFAULT_START_BLOCK,
    endblock = EtherscanHTTP.DEFAULT_END_BLOCK,
    ERC20TokenAddress = null,
    mintOnly = false
  ) {
    this.baseURL = this.config.baseURL;
    const { url, method, params, data } = this.config
      .listTx(address, startblock, endblock);
    
    const txs = await this.request(url, method, params, data);

    if (this.config.includeLogs && txs.length > 0) {
      const blocks = txs.map(tx => parseInt(tx.blockNumber));
      const logs = await this.getTxLogs(
        ERC20TokenAddress || address,
        Math.min(...blocks),
        Math.max(...blocks),
        !!ERC20TokenAddress,
        mintOnly
      );

      for (let tx of txs) {
        const { hash } = tx;

        tx[EtherscanHTTP.LOGS_KEY] = [];

        for (let log of logs) {
          const { transactionHash } = log;

          if (hash === transactionHash) {
            tx[EtherscanHTTP.LOGS_KEY].push(log);
          }
        }

        debug(
          'logs',
          tx[EtherscanHTTP.LOGS_KEY]
            ? tx[EtherscanHTTP.LOGS_KEY].length
            : 0
        );
      }
    }
    
    return this.tryPushAndClose(...txs);
  }

  /**
   * Get logs for ERC20 token mint transfers
   * @param {string} address 
   * @param {number} fromBlock 
   * @param {number} toBlock 
   * @param {boolean} isERC20
   * @param {boolean} mintOnly
   */
  async getTxLogs(address, fromBlock, toBlock, isERC20 = false, mintOnly = false) {
    if (isERC20) {
      const { url, method, params, data } = this.config
        .listERC20Transfers(address, fromBlock, toBlock, mintOnly);

      return this.request(url, method, params, data);
    }
    
    const { url, method, params, data } = this.config
        .listLogs(address, fromBlock, toBlock);

    return this.request(url, method, params, data);
  }

  /**
   * Transform response in items
   * @param {*} response 
   */
  async transform(response) {
    return response.data.result || [];
  }

  /**
   * Logs key
   */
  static get LOGS_KEY() {
    return '$logs';
  }

  /**
   * Default tx start block
   */
  static get DEFAULT_START_BLOCK() {
    return 0;
  }

  /**
   * Default tx end block
   */
  static get DEFAULT_END_BLOCK() {
    return 99999999999999;
  }
}


module.exports = EtherscanHTTP;
