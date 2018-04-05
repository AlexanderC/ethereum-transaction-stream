const debug = require('debug')('ets:provider:middleware');
const batch = require('p-all');
const InvalidHandleError = require('./error/invalid-handle');

class Middleware {
  /**
   * @param {Number} concurrency 
   */
  constructor(concurrency = Middleware.DEFAULT_CONCURRENCY) {
    this.concurrency = concurrency;
    this.actions = [];
  }

  /**
   * Registers a handle
   * @param {function} handle 
   */
  register(handle) {
    if (!handle || typeof handle !== 'function') {
      throw new InvalidHandleError();
    }

    this.actions.push(handle);

    return this;
  }

  /**
   * Dispatch transaction
   * @param {Provider} context
   * @param {Array} items 
   */
  async dispatch(context, ...items) {
    const { concurrency } = this;

    return batch(items.map((item) => {
      return async () => this._dispatch(context, item);
    }), { concurrency });
  }

  /**
   * Dispatch single item
   * @param {Provider} context 
   * @param {*} item 
   */
  async _dispatch(context, item) {
    const shortItem = Object.assign({}, item, { input: '0x...' });
    
    debug('dispatch', JSON.stringify(shortItem));

    for (let action of this.actions) {
      debug('apply', action);

      item = await action(item, context);
    }

    return item;
  }

  /**
   * Default concurrency
   */
  static get DEFAULT_CONCURRENCY() {
    return 10;
  }
}

module.exports = Middleware;
