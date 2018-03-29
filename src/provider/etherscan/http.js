const EtherscanProvider = require('./provider');

class EtherscanHTTP extends EtherscanProvider {
  /**
   * @param {string} address
   */
  async start(
    address,
    startblock = EtherscanHTTP.DEFAULT_START_BLOCK,
    endblock = EtherscanHTTP.DEFAULT_END_BLOCK
  ) {
    this.baseURL = this.config.baseURL;
    
    const { url, method, params, data } = this.config
      .listTx(address, startblock, endblock);
    
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
