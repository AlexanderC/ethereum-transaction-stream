class Config {
  /**
   * @param {string} network 
   * @param {string} apiKey
   */
  constructor(
    network = Config.MAINNET,
    apiKey = Config.DEFAULT_API_KEY,
    includeInternal = Config.DEFAULT_INCLUDE_INTERNAL
  ) {
    this.network = network;
    this.apiKey = apiKey;
    this.includeInternal = includeInternal;
  }

  /**
   * List internal transactions
   * @param {*} tx 
   * @ref https://etherscan.io/apis#accounts
   */
  listInternalTx(tx) {
    const txhash = tx.hash;

    return {
      url: '',
      method: 'GET',
      params: {
        module: 'account',
        action: 'txlistinternal',
        txhash: tx.hash,
        apikey: this.apiKey,
      },
      data: {},
    };
  }

  /**
   * List transactions
   * @param {string} address 
   * @param {number} startblock
   * @param {number} endblock
   * @param {string} sort
   * @ref https://etherscan.io/apis#accounts
   */
  listTx(address, startblock, endblock, sort = 'desc') {
    return {
      url: '',
      method: 'GET',
      params: {
        address,
        startblock,
        endblock,
        sort,
        module: 'account',
        action: 'txlist',
        apikey: this.apiKey,
      },
      data: {},
    };
  }

  /**
   * Websocket ping request
   */
  wsPing() {
    return { event: 'ping' };
  }

  /**
   * Websocket transactions subscription
   * @param {string} address
   */
  wsSubscribeTxList(address) {
    return { address, event: 'txlist' };
  }

  /**
   * Base URL
   */
  get baseURL() {
    let suffix;

    switch (this.network) {
      case Config.RINKEBY:
      case Config.ROPSTEN:
        suffix = `-${ this.network }`;
        break;
      case Config.MAINNET:
      case null:
      default:
        suffix = '';
    }

    return `https://api${ suffix }.etherscan.io/api`;
  }

  /**
   * Websocket URL
   */
  get wsURL() {
    if (this.network && this.network !== Config.MAINNET) {
      return null;
    }

    return 'wss://socket.etherscan.io/wshandler';
  }

  /**
   * Websocket ping interval
   * @ref https://etherscan.io/apis#websocket
   */
  get wsPingInterval() {
    return Config.DEFAULT_WS_PING_INTERVAL;
  }

  /**
   * WS polyfill pooling interval
   */
  get wsPoolingInterval() {
    return Config.DEFAULT_WS_POOLING_INTERVAL;
  }

  /**
   * Rinkeby network
   */
  static get RINKEBY() {
    return 'rinkeby';
  }

  /**
   * Ropsten network
   */
  static get ROPSTEN() {
    return 'ropsten';
  }

  /**
   * Mainnet network
   */
  static get MAINNET() {
    return 'mainnet';
  }

  /**
   * Default ping
   */
  static get DEFAULT_WS_POOLING_INTERVAL() {
    return 2000;
  }

  /**
   * Default internal transactions include
   */
  static get DEFAULT_INCLUDE_INTERNAL() {
    return false;
  }

  /**
   * Default ping
   */
  static get DEFAULT_WS_PING_INTERVAL() {
    return 20000;
  }

  /**
   * Default API key
   */
  static get DEFAULT_API_KEY() {
    return 'YourApiKeyToken';
  }
}

module.exports = Config;
