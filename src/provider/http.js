const axios = require('axios');
const debug = require('debug')('ets:provider:http');
const Provider = require('./provider');
const MissingProviderContextError = require('./error/missing-provider-context');

class HTTP extends Provider {
  /**
   * Do a request
   * @param {string} url 
   * @param {string} method 
   * @param {*} params 
   * @param {*} data 
   */
  async rawRequest(url, method = 'GET', params = {}, data = {}) {
    return this.client.request({ url, method, params, data });
  }

  /**
   * Do a request
   * @param {string} url 
   * @param {string} method 
   * @param {*} params 
   * @param {*} data 
   */
  async request(url, method = 'GET', params = {}, data = {}) {
    const response = await this.rawRequest(...arguments);
    const items = await this.transform(response);

    try {
      await this.push(...items);
      await this.close();
    } catch (error) {
      debug(
        'context has been closed before items arrival',
        error.message
      );
    }

    return this;
  }

  /**
   * Transform response in items
   * @param {*} response 
   */
  async transform(response) {
    return [ response.data ];
  }

  /**
   * Get client
   */
  get client() {
    const { baseURL } = this.config;

    if (baseURL) {
      return axios.create({ baseURL });
    }

    return axios.create();
  }
}

module.exports = HTTP;
