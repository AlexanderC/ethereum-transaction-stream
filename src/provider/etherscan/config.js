class Config {
  /**
   * @param {string} network 
   * @param {string} apiKey
   */
  constructor(
    network = Config.MAINNET,
    apiKey = Config.DEFAULT_API_KEY,
    includeInternal = Config.DEFAULT_INCLUDE_INTERNAL,
    includeLogs = Config.DEFAULT_INCLUDE_LOGS
  ) {
    this.network = network;
    this.apiKey = apiKey;
    this.includeInternal = includeInternal;
    this.includeLogs = includeLogs;
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
   * List logs
   * @param {string} address 
   * @param {number} fromBlock
   * @param {number} toBlock
   * @param {Array} topics
   * @ref https://etherscan.io/apis#accounts
   */
  listLogs(address, fromBlock, toBlock, topics = []) {
    const result = {
      url: '',
      method: 'GET',
      params: {
        address,
        fromBlock,
        toBlock,
        module: 'logs',
        action: 'getLogs',
        apikey: this.apiKey,
      },
      data: {},
    };

    for (let i in topics) {
      result.params[`topic${ i }`] = topics[i];
    }

    return result;
  }

  /**
   * List logs for ERC20 token transfers
   * @param {string} address 
   * @param {number} fromBlock
   * @param {number} toBlock
   * @param {boolean} mintOnly
   * @ref https://etherscan.io/apis#accounts
   */
  listERC20Transfers(address, fromBlock, toBlock, mintOnly = false) {
    const topics = [ Config.ERC20_TRANSFER_ABI ];

    if (mintOnly) {
      topics.push(Config.ROOT_ADDRESS);
    }

    return this.listLogs(address, fromBlock, toBlock, topics);
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
   * Root address
   */
  static get ROOT_ADDRESS() {
    return '0x0000000000000000000000000000000000000000000000000000000000000000';
  }

  /**
   * ERC20 tokens TRANSFER() event ABI
   */
  static get ERC20_TRANSFER_ABI() {
    return '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
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
   * Default logs include
   */
  static get DEFAULT_INCLUDE_LOGS() {
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
