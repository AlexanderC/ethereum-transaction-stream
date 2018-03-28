const EtherscanProvider = require('./provider');

class EtherscanHTTP extends EtherscanProvider {
  /**
   * @param {string} address
   */
  async start(address) {
    const { url, method, params, data } = this.config.listTx(address);
    this.baseURL = this.config.baseURL;

    return this.request(url, method, params, data);
  }

  /**
   * Transform response in items
   * @param {*} response 
   */
  async transform(response) {
    return response.data.result || [];
  }
}


module.exports = EtherscanHTTP;
