const Rx = require('rxjs/Rx');
const domain = require('domain');
const debug = require('debug')('ets:provider');
const MissingProviderContextError = require('./error/missing-provider-context');
const NotImplementedError = require('./error/not-implemented');
const ProviderContextSetError = require('./error/provider-context-already-set');
const Middleware = require('./middleware');

class Provider {
  /**
   * @param {*} config 
   */
  constructor(config = {}) {
    this.middleware = new Middleware();
    this.config = config;
    this._observable = null;
    this._context = null;
    this._onContextActions = [];
  }

  /**
   * Listen for items when subscribed
   */
  async listen(...args) {
    debug('listen');

    if (this.hasContext) {
      throw new ProviderContextSetError();
    }

    this._onContextActions.push(
      async () => this.start(...args)
    );

    this._fillContext();

    return this;
  }

  /**
   * Start listening for items
   */
  async start() {
    throw new NotImplementedError();

    return this;
  }

  /**
   * Close the stream
   * @param {boolean} reset
   */
  async close() {
    debug('close');

    if (this.hasContext) {
      this._context.complete();
      this._observable = null;
      this._context = null;
      this._onContextActions = [];
      this.middleware = new Middleware();
    }

    return this;
  }

  /**
   * Push items into the stream
   * @param {*} items 
   */
  async push(...items) {
    debug('push items', items.length);

    if (!this.hasContext) {
      throw new MissingProviderContextError();
    }

    // @todo check effectiveness
    items = await this.middleware.dispatch(this, ...items);

    for (let item of items) {
      this._context.next(item);
    }

    return this;
  }

  /**
   * Subscribe to the stream
   * @param {*} args 
   * @ref http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-subscribe
   */
  async subscribe(...args) {
    debug('subscribe', args);

    this.observable.subscribe(...args);

    return this;
  }

  /**
   * Wait for all items to arrive
   * AVOID USING THIS!
   * Use subscribe() instead...
   * @deprecated
   */
  async waitAll() {
    debug('wait all items');

    return new Promise((resolve, reject) => {
      const accumulator = [];

      this.observable.subscribe(
        item => accumulator.push(item),
        error => reject(error),
        () => resolve(accumulator)
      );
    });
  }

  /**
   * Configure provider
   * @param {string} key 
   * @param {*} value 
   */
  configure(key, value) {
    if (this.hasContext) {
      throw new ProviderContextSetError();
    }

    this.config[key] = value;

    return this;
  }

  /**
   * Function triggered on context creation
   */
  async onContext() {}

  /**
   * Get observable instance
   */
  get observable() {
    return this._observable;
  }

  /**
   * Check if context set
   */
  get hasContext() {
    return !!(this._observable && this._context);
  }

  /**
   * Fill the provider context
   */
  _fillContext() {
    debug('fill the context');

    this._observable = Rx.Observable.create(async (observer) => {
      this._context = observer;

      await this.onContext();

      debug('create runtime domain');

      const runtime = domain.create();

      // @todo figure out if it makes sense
      const issues = [ 'error', 'uncaughtException', 'unhandledRejection' ];

      debug('register runtime guards for', issues);

      for (let issue of issues) {
        runtime.on(issue, (error) => {
          observer.error(error);
          this.close();
        });
      }

      runtime.run(async () => {
        debug('dispatch context actions');

        for (let action of this._onContextActions) {
          debug('action', action);

          try {
            await action();
          } catch (error) {
            
            // Remember: we're in promise context...
            setImmediate(() => { throw error });
          }
        }
      });
    });

    return this;
  }

  /**
   * Creates an instance of current provider
   * @param {*} args 
   */
  static create(...args) {
    return new this(...args);
  }
}

module.exports = Provider;
