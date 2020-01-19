import HubBridge from './HubBridge';
import WalletBridge from './WalletBridge';
import showWalletSelector from './WalletSelector';

const id = () => (Math.random() * 100000000) | 0;

export default class BurnerProvider {
  public hub: HubBridge;
  public connected = false;
  public walletBridge: WalletBridge | null = null;
  public wallet: any = null;
  public network = '1';

  constructor(hubUrl = 'https://burnerconnect.xyz/') {
    this.hub = new HubBridge(hubUrl);
  }

  setNetwork(network: string) {
    this.network = network;
  }

  enable() {
    if (this.connected) {
      return Promise.resolve();
    }

    return this.hub.getWallets()
      .then((wallets: any[]) => this.showPrompt(wallets))
      .then(() => this.walletBridge!.send({
        id: id(),
        method: 'eth_accounts',
        network: this.network,
      }))
      .then(() => { this.connected = true })
      .catch(() => null);
  }

  showPrompt(wallets: any[]) {
    return showWalletSelector(wallets)
      .then((wallet: any) => {
        this.wallet = wallet;
        this.walletBridge = new WalletBridge(wallet.origin);
      });
  }

  send() {
    throw new Error('send not supported');
  }

  sendAsync(payload: any, cb: any) {
    if (!this.connected) {
      throw new Error('BurnerConnect Provider is not connected');
    }

    this.walletBridge!.send({ network: this.network, ...payload })
      .then((result: any) => cb(null, result))
      .catch((error: any) => cb(error));
  }
}