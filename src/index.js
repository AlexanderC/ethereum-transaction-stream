'use strict';

const Provider = require('./provider/provider');
const MultiProvider = require('./provider/multi-provider');
const EtherscanHTTP = require('./provider/etherscan/http');
const EtherscanWS = require('./provider/etherscan/ws');
const StreamInUseError = require('./error/stream-in-use');
const EtherscanConfig = require('./provider/etherscan/config');

class EthTS {
  /**
   * @param {*} providers 
   */
  constructor(...providers) {
    this.providers = providers;
    this.unitOfWork = new MultiProvider(this.providers);
  }

  /**
   * Configure providers.
   * Alias to stream.configure()
   */
  configure(key, value) {
    this.unitOfWork.configure(key, value);

    return this;
  }

  /**
   * Reset providers.
   * Alias to stream.close()
   */
  async close() {
    await this.unitOfWork.close();

    return this;
  }

  /**
   * Start stream
   * @param {*} args 
   */
  async stream(...args) {
    if (this.streamInUse) {
      throw new StreamInUseError();
    }

    return this.unitOfWork.listen(...args);
  }

  /**
   * Check if stream is in use
   */
  get streamInUse() {
    return this.unitOfWork.hasContext;
  }

  /**
   * Create a new instance
   * @param {string[]} providers 
   */
  static create(...providers) {
    const providersPlain = [];
    const providerInstances = [];

    for (let provider of providers) {
      if (Array.isArray(provider)) {
        for (let singleProvider of provider) {
          providersPlain.push(singleProvider);
        }
      } else {
        providersPlain.push(provider);
      }
    }

    for (let provider of providersPlain) {
      if (provider instanceof Provider) {
        providerInstances.push(provider);
        continue;
      }

      providerInstances.push(provider.create());
    }

    return new this(...providerInstances);
  }

  /**
   * Etherscan configuration constructor
   */
  static get EtherscanConfig() {
    return EtherscanConfig;
  }

  /**
   * Available providers
   */
  static get PROVIDERS() {
    return {
      EtherscanWS: EtherscanWS,
      EtherscanHTTP: EtherscanHTTP,
      Etherscan: [ EtherscanHTTP, EtherscanWS ],
    };
  }
}

module.exports = EthTS;
