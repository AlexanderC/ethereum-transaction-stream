const debug = require('debug')('ets:ws');
const Connection = require('./connection');

class MockConnection extends Connection {
  /**
   * @inheritDoc
   */
  async connect(context, address) {
    debug('ws mock connect');

    return this;
  }

  /**
   * @inheritDoc
   */
  async close() {
    debug('ws mock close');

    return this;
  }
}

module.exports = MockConnection;
