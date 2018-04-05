const { clearInterval, setInterval } = require('timers');
const WebSocket = require('ws');
const debug = require('debug')('ets:ws');
const Connection = require('./connection');
const NotConnectedError = require('./error/not-connected');

class NativeConnection extends Connection {
  /**
   * @param {*} args 
   */
  constructor(...args) {
    super(...args);
    
    this.ws = null;
    this._keepAliveInterval = null;
  }

  /**
   * @inheritDoc 
   */
  async connect(context, address) {
    return new Promise((resolve, reject) => {
      debug('ws connect:', this.url);

      let hasOpened = false;
      const ws = new WebSocket(this.url);

      ws.on('error', async (error) => {
        debug('ws error:', error.message);

        if (!hasOpened) {
          context.close();
          reject(error);
        }
      });
      
      ws.on('open', async () => {
        hasOpened = true;
        this.ws = ws;

        debug('ws open');

        await this._keepAlive();
        await this._subscribe(address);

        ws.on('message', async (msg) => {
          await this._receive(msg, context);
        });

        ws.on('close', async (msg) => {
          context.close();
        });

        resolve(this);
      });
    });
  }

  /**
   * @inheritDoc
   */
  async close() {
    if (this._keepAliveInterval) {
      clearInterval(this._keepAliveInterval);
      this._keepAliveInterval = null;
    }

    if (this.ws) {
      debug('ws close');

      this.ws.close();
      this.ws = null;
    }

    return this;
  }

  /**
   * Subscribe for receiving transactions
   * @todo check for response
   */
  async _subscribe(address) {
    if (!this.ws) {
      throw new NotConnectedError();
    }

    await this._send(this.config.wsSubscribeTxList(address));

    return this;
  }

  /**
   * Keep connection alive
   */
  async _keepAlive() {
    if (!this.ws) {
      throw new NotConnectedError();
    }
    
    if (this._keepAliveInterval) {
      clearInterval(this._keepAliveInterval);
    }

    debug('ws schedule handshake');

    this._keepAliveInterval = setInterval(async () => {
      await this._send(this.config.wsPing());
    }, this.pingInterval);

    return this;
  }

  /**
   * Receive ws message
   * @param {*} msg 
   * @param {Provider} context
   */
  async _receive(msg, context) {
    debug('ws <<<', msg);

    const data = JSON.parse(msg);

    if (data.result && Array.isArray(data.result)) {
      await context.push(...data.result);
    }

    return this;
  }

  /**
   * Send ws message
   * @param {*} request
   */
  async _send(request) {
    if (!this.ws) {
      throw new NotConnectedError();
    }

    const msg = JSON.stringify(request);
    
    debug('ws >>>', msg);

    this.ws.send(msg);
    
    return this;
  }

  /**
   * Check if websocket is ssupported
   */
  static get isSupported() {
    return !!WebSocket;
  }
}

module.exports = NativeConnection;
