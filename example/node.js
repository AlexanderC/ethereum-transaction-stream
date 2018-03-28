const EthTS = require('../src/index');
const ets = EthTS.create(EthTS.PROVIDERS.Etherscan);

(async (EthTS) => {
  const ets = EthTS.create(EthTS.PROVIDERS.Etherscan);

  // creates a new stream
  const stream = await ets.stream('0x4a1eade6b3780b50582344c162a547d04e4e8e4a');

  console.log('in use:', ets.streamInUse); // false

  const txs = [];

  // subscribes to the stream
  // there is a "const txs = await stream.waitAll()" method
  // however you should avoid it- it might hang your process (e.g. with ws provider)
  await stream.subscribe((tx) => {
    txs.push(tx);

    console.log('+1');
  });

  console.log('in use:', ets.streamInUse); // true

  // Keep alive the connection for 10 seconds
  await new Promise((resolve) => {
    setTimeout(async () => {
      await stream.close(); // or "await ets.close()" which is an alias
      resolve();
    }, 10000);
  });

  console.log('Transactions received:', txs.length);
})(EthTS);
