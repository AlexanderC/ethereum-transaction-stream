ethereum-transaction-stream
===========

Relatime Ethereum transactions tracking library

# Installation

```bash
npm install ethereum-transaction-stream
```

# Features

- Works in Node.js and browsers (incl. websocket fallback)
- Fetches historical transactions besides realtime tracking
- Handles transactions tracking for testnet (despite lack of Etherscan support)
- Possibility to include internal transactions (per tx)
- Possibility to include ERC20 tokens minting logs (per tx)

# Usage

```javascript
// import EthTS from 'ethereum-transaction-stream/dist/browser';
// import EthTS from 'ethereum-transaction-stream';
// const { EthTS } = window;
const EthTS = require('ethereum-transaction-stream');

(async (EthTS) => {
  const ets = EthTS

      // EthTS.PROVIDERS.Etherscan
      // EthTS.PROVIDERS.EtherscanWS
      // EthTS.PROVIDERS.EtherscanHTTP
      .create(EthTS.PROVIDERS.EtherscanWS)

      // EthTS.EtherscanConfig.MAINNET (default)
      // EthTS.EtherscanConfig.ROPSTEN
      // EthTS.EtherscanConfig.RINKEBY
      .configure('network', EthTS.EtherscanConfig.ROPSTEN)

      // Include internal txs (e.g. proxy value to another address)
      // Default: false
      .configure('includeInternal', true)

      // Include logs (e.g. token minting)
      // Important: this is currently available for EtherscanHTTP only
      // Default: false
      .configure('includeLogs', true);

  // Creates a new stream.
  // Note that "startblock", "endblock", "ERC20TokenAddress" and "mintOnly" options
  // are only available for "EtherscanHTTP" provider. By including "ERC20TokenAddress"
  // there will be included transactions for ERC20 token only and enabling "mintOnly"
  // option will result in leaving only token minting events.
  // Important: "ERC20TokenAddress" and "mintOnly" options are available only when "includeLogs" enabled
  // Important: the result will INCLUDE transactions from the "startblock"
  const stream = await ets.stream(
    '0x4a1eade6b3780b50582344c162a547d04e4e8e4a'
    /*, startblock, endblock, ERC20TokenAddress, mintOnly */
  );

  console.log('in use:', ets.streamInUse); // false

  const txs = [];

  // Subscribes to the stream.
  // There is a "const txs = await stream.waitAll()" method
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
```

> Enabling `includeInternal` option might slow down the performance considerably

For more examples check out `/example` folder.

# Testing

```bash
npm run test # npm run test:v|vvv for debugging
```

# Roadmap

- [ ] Add ERC20 tokens transfer fetching
- [ ] Add custom events processing
- [ ] Include logs into the native WS provider

# Support development

I really love open source, however i do need your help to
keep the library up to date. There are several ways to do it:
open issues, submit PRs, share the library w/ community or simply-

<a href="https://etherdonation.com/d?to=0x4a1eade6b3780b50582344c162a547d04e4e8e4a" target="_blank" title="Donate ETH"><img src="https://etherdonation.com/i/btn/donate-btn.png" alt="Donate ETH"/></a>
