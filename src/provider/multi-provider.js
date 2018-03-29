const Rx = require('rxjs/Rx');
const Provider = require('./provider');

class MultiProvider extends Provider {
  /**
   * @param {Provider[]} providers 
   */
  constructor(providers) {
    super();

    this.providers = providers;
  }

  /**
   * @inheritDoc
   */
  async listen(...args) {
    for (let provider of this.providers) {
      await provider.listen(...args);
    }

    return this;
  }

  /**
   * @inheritDoc
   */
  async start(...args) {
    for (let provider of this.providers) {
      await provider.start(...args);
    }

    return this;
  }

  /**
   * @inheritDoc
   */
  async close() {
    for (let provider of this.providers) {
      await provider.close();
    }

    return this;
  }

  /**
   * @inheritDoc
   */
  async push(...items) {
    for (let provider of this.providers) {
      await provider.push(...items);
    }

    return this;
  }

  /**
   * @inheritDoc
   */
  configure(...args) {
    for (let provider of this.providers) {
      provider.configure(...args);
    }

    return this;
  }

  /**
   * Build observable
   * @ref http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#static-method-merge
   */
  get observable() {
    const observables = this.providers.map(p => p.observable);

    return Rx.Observable.merge(...observables);
  }

  /**
   * Check if context set
   */
  get hasContext() {
    return this.providers
      .map(p => p.hasContext)
      .filter(Boolean)
      .length > 0;
  }

  /**
   * Avoid any logic here...
   */
  _fillContext() {}
}

module.exports = MultiProvider;
