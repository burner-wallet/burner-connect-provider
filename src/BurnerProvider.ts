import { EventEmitter } from 'events';
import HubBridge from './HubBridge';
import WalletBridge from './WalletBridge';
import showWalletSelector from './WalletSelector';

const id = () => (Math.random() * 100000000) | 0;

interface ConstructorProps {
  hubUrl?: string;
  defaultNetwork?: string;
}

export default class BurnerProvider extends EventEmitter {
  public isBurnerProvider = true;
  public hub: HubBridge;
  public connected = false;
  public walletBridge: WalletBridge | null = null;
  public wallet: any = null;
  public network: string;
  private _nextJsonRpcId = 0;

  constructor({
    hubUrl = 'https://burnerconnect.xyz/',
    defaultNetwork = '1',
  }: ConstructorProps = {}) {
    super();
    this.network = defaultNetwork;
    this.hub = new HubBridge(hubUrl);

    // @ts-ignore
    this.on = null; // Override this, otherwise Web3 will try to use subscriptions

    window.addEventListener('message', (event: any) => {
      if (this.walletBridge && event.origin === this.walletBridge.origin && event.data.message) {
        if (event.data.message === 'accountsChanged') {
          this.emit('accountsChanged', event.data.accounts);
        }
      }
    });
  }

  setNetwork(network: string) {
    if (network !== this.network) {
      this.network = network;
      this.emit('chainChanged', network);
    }
  }

  async getAssets() {
    const bridge = this.getBridge();
    await bridge.ensureIFrame();
    const assets = await bridge.sendCommand('getAssets');
    return assets;
  }

  enable() {
    if (this.connected) {
      return Promise.resolve();
    }

    return this.hub.getWallets()
      .then((wallets: any[]) => this.showPrompt(wallets))
      .then(async () => {
        const accounts = await this.getBridge().send({
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

    return this.getBridge().send({ network: this.network, ...payload });
  }

  sendAsync(payload: any, cb: any) {
    if (!this.connected) {
      throw new Error('BurnerConnect Provider is not connected');
    }

    this.getBridge().send({ network: this.network, ...payload })
      .then(({ result }: any) => cb(null, { id: payload.id, jsonrpc: '2.0', result }))
      .catch((error: any) => cb(error));
  }

  getBridge(): WalletBridge {
    if (!this.walletBridge) {
      throw new Error(`BurnerConnect is not yet connected`);
    }
    return this.walletBridge;
  }
}