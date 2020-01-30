# BurnerConnect Provider

Allows any site to connect to accounts on a Burner Wallet that has been used on the same site.

Supported by web3connect.

## Usage

```javascript
import BurnerConnectProvider from '@burner-wallet/burner-connect-provider';
import Web3 from 'web3';

(async function() {
  const provider = new BurnerConnectProvider();

  await provider.enable();

  const web3 = new Web3(provider);

  const accounts = await web3.eth.getAccounts();
  web3.eth.sendTransaction({
    from: accounts[0],
    //...
  });
})()
```


## Methods

### enable()

Show the prompt for users to connect to a Burner Wallet.

### setNetwork

Pass a chain ID to set the network that the provider connects to ('1' for mainnet, '100' for xDai, etc).

### getAssets

Returns a promise for a list of assets supported by the connected Burner Wallet.
