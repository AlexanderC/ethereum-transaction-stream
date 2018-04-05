const { assert } = require('chai');
const { XMLHttpRequest } = require('xmlhttprequest');
const WebSocket = require('ws');
const debug = require('debug')('test:general');
const pkg = require('../package.json');
let EthTS = require('../src/index');

if (process.env.BROWSER) {
  debug('TEST BROWSER BUILD');
  
  // We need this for properly loading browser Chatbot client
  global.window = global;
  global.XMLHttpRequest = XMLHttpRequest;
  global.WebSocket = require('ws');

  EthTS = require(`../dist/browser.js`);
}

process.on('unhandledRejection', (error) => {
  console.error(error);
  process.exit(1);
});

describe('Generic', function() {
  it('healthcheck', async function() {
    assert.equal(true, true, 'Healthcheck failed');
  });
});

describe('EthTS', function() {
  it('check Etherscan HTTP', async function() {
    const ets = EthTS.create(EthTS.PROVIDERS.EtherscanHTTP);

    let txs1, txs2;
    let error1, error2;
    
    try {
      const stream = await ets.stream('0x546ccFd3dCC18732636317CE09fF5213C43AFb06');
      txs1 = await stream.waitAll();

      for (let tx of txs1) {
        tx.input = '0x...';
        debug('received tx', JSON.stringify(tx));
      }
    } catch (e) {
      error1 = e;
    }

    try {
      const stream = await ets.stream('0x546ccFd3dCC18732636317CE09fF5213C43AFb06');
      txs2 = await stream.waitAll();
    } catch (e) {
      error2 = e;
    }
    
    assert.notInstanceOf(error1, Error, 'Failed to retrieve transactions first time');
    assert.notInstanceOf(error2, Error, 'Failed to retrieve transactions second time');
    assert.equal(txs1.length, txs2.length, 'Number of transactions differs');
  });

  it('check Etherscan WS', async function() {
    let txs = [
      {"blockNumber":"49109","timeStamp":"1438968167","hash":"0xb4b836183334510812525c79ee13722783452716f77b3fd5e4b1ec5a21f7a81e","nonce":"3","blockHash":"0x7549887277630a31450d802a944e8f28397b1e1f15867b6c75633675323633e4","transactionIndex":"2","from":"0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a","to":"0x2910543af39aba0cd09dbb2d50200b3e800a63d2","value":"988950000000000000000","gas":"23000","gasPrice":"500000000000","isError":"0","txreceipt_status":"","input":"0x454e34354139455138","contractAddress":"","cumulativeGasUsed":"64836","gasUsed":"21612","confirmations":"5287172"},
      {"blockNumber":"101773","timeStamp":"1439827863","hash":"0x70bc1a43c9e80caae6b69fe845ba1567826413a8e42d020837c3b09f9cad11c2","nonce":"5","blockHash":"0xe802363e95a7e4700058c64f308ff726eba63ec7a40083e65a0c8dd9124578fe","transactionIndex":"5","from":"0x1a56a50c378d21d0aa544ed9a482300c7f6e78ec","to":"0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a","value":"84512559000000000000000","gas":"21000","gasPrice":"100000000000","isError":"0","txreceipt_status":"","input":"0x","contractAddress":"","cumulativeGasUsed":"126000","gasUsed":"21000","confirmations":"5234508"},
      {"blockNumber":"269968","timeStamp":"1442872420","hash":"0xf0ee803e146465fcebfe092041e187920832a474b1c989b36eee7e0dc6b3f09c","nonce":"4","blockHash":"0x4b55bddbcea00085a00903c0ddb31c2933923054a5f8ff080ec8a8bab2a33e1d","transactionIndex":"0","from":"0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a","to":"0xc98756f014149787cee4f74328c4925dc0ce9779","value":"700000000000000000000","gas":"21000","gasPrice":"300000000000","isError":"0","txreceipt_status":"","input":"0x","contractAddress":"","cumulativeGasUsed":"21000","gasUsed":"21000","confirmations":"5066313"},
    ];
    let pingCount = 0;
    let subscribeCalled = false;
    const wss = new WebSocket.Server({ port: 8181 });

    wss.on('connection', (ws) => {
      ws.send('{"event":"welcome"}');

      ws.on('message', (msg) => {
        debug('wss <<<', msg);

        const data = JSON.parse(msg);

        if (data.event === 'txlist') {
          subscribeCalled = true;

          const response = `{"event":"subscribe-txlist", "status":"1", "message":"OK, ${ data.address }"}`;
          debug('wss >>>', response);
          ws.send(response);

          let timeout = 1000;

          for (let tx of txs) {
            setTimeout(() => {
              tx.from = data.address;
              const response = `{"event":"txlist","address":"${ data.address }","result":[${ JSON.stringify(tx) }]}`;
              debug('wss >>>', response);
              ws.send(response);
            }, timeout);

            timeout+= timeout;
          }
        } else if (data.event === 'ping') {
          pingCount++;

          const response = '{"event": "pong"}';
          debug('wss >>>', response);
          ws.send(response);
        }
      });

      ws.on('close', () => {
        debug('wss close');
      });
    });
    
    // Broadcast to all.
    wss.broadcast = function broadcast(data) {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send('{"event":"welcome"}');
        }
      });
    };

    const ets = EthTS.create(EthTS.PROVIDERS.EtherscanWS);
    const wsProvider = ets.providers[0];
    const wsClient = wsProvider.connection;
    const config = wsClient.config;

    wsClient.config = {
      wsURL: 'ws://localhost:8181',
      wsPingInterval: 3000,
      wsPing: config.wsPing.bind(config),
      wsSubscribeTxList: config.wsSubscribeTxList.bind(config),
    };

    let error;
    let receivedTxs = 0;

    try {
      const address = '0x4a1eade6b3780b50582344c162a547d04e4e8e4a';
      const stream = await ets.stream(address);

      await stream.subscribe((tx) => {
        tx.input = '0x...';
        debug('received tx', JSON.stringify(tx));

        if (tx.from !== address && tx.to !== address) {
          throw new Error('Transaction address mismatch');
        }
        
        receivedTxs++;
      });

      await new Promise((resolve) => {
        setTimeout(async () => {
          await stream.close();
          wss.close();
          resolve();
        }, 10000);
      });
    } catch (e) {
      error = e;
    }

    assert.isTrue(subscribeCalled, 'Subscription has not been sent');
    assert.equal(receivedTxs, txs.length, 'Some transactions have been lost');
    assert.equal(pingCount, 3, 'Ping has not been sent 3 times');
    assert.notInstanceOf(error, Error, 'Failed to subscribe for transactions');
  });

  it('check Etherscan (all)', async function() {
    const ets = EthTS.create(EthTS.PROVIDERS.Etherscan);

    let errorReinit = false;
    let error, streamInUseBeforeStatus, streamInUseStatus;
    
    try {
      const stream = await ets.stream('0x4a1eade6b3780b50582344c162a547d04e4e8e4a');

      streamInUseBeforeStatus = ets.streamInUse;

      await stream.subscribe((tx) => {
        tx.input = '0x...';
        debug('received tx', JSON.stringify(tx));
      });

      streamInUseStatus = ets.streamInUse;

      try {
        await ets.stream('0x4a1eade6b3780b50582344c162a547d04e4e8e4a');
      } catch (e) {
        errorReinit = true;
      }

      await new Promise((resolve) => {
        setTimeout(async () => {
          await stream.close();
          resolve();
        }, 5000);
      });
    } catch (e) {
      error = e;
    }
    
    assert.notInstanceOf(error, Error, 'Failed to listen for transactions');
    assert.isFalse(streamInUseBeforeStatus, 'Stream is in use, however it is actually not');
    assert.isTrue(streamInUseStatus, 'Stream is not in use, however it actually is');
    assert.isTrue(errorReinit, 'Was able to reinitialize stream in use');
  });
});
