import { EventEmitter } from 'events';
import HubBridge from './HubBridge';
import WalletBridge from './WalletBridge';
import showWalletSelector from './WalletSelector';

const id = () => (Math.random() * 100000000) | 0;

export default class BurnerProvider extends EventEmitter {
  public hub: HubBridge;
  public connected = false;
  public walletBridge: WalletBridge | null = null;
  public wallet: any = null;
  public network = '1';
  private _nextJsonRpcId = 0;

  constructor(hubUrl = 'https://burnerconnect.xyz/') {
    super();
    this.hub = new HubBridge(hubUrl);
  }

  setNetwork(network: string) {
    this.network = network;
    this.emit('chainChanged', network);
  }

  enable() {
    if (this.connected) {
      return Promise.resolve();
    }

    return this.hub.getWallets()
      .then((wallets: any[]) => this.showPrompt(wallets))
      .then(async () => {
        const accounts = await this.walletBridge!.send({
          id: id(),
          method: 'eth_accounts',
          network: this.network,
        });
        this.connected = true;
        this.emit('connect');
      })
      .catch(() => null);
  }

  showPrompt(wallets: any[]) {
    return showWalletSelector(wallets)
      .then((wallet: any) => {
        this.wallet = wallet;
        this.walletBridge = new WalletBridge(wallet.origin);
      });
  }

  send(method: string, params: any[] = []) {
    if (!method || typeof method !== 'string') {
      return new Error('Method is not a valid string.');
    }

    if (!(params instanceof Array)) {
      return new Error('Params is not a valid array.');
    }

    const id = this._nextJsonRpcId++;
    const payload = { jsonrpc: '2.0', id, method, params };

    return this.walletBridge!.send({ network: this.network, ...payload });
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