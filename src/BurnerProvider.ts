import { EventEmitter } from 'events';
import HubBridge from './HubBridge';
import WalletBridge from './WalletBridge';
import WalletLogin from './WalletLogin';
import WalletSelector from './WalletSelector';

const id = () => (Math.random() * 100000000) | 0;

export interface Wallet {
  origin: string;
  name: string;
}

interface ConstructorProps {
  hubUrl?: string;
  defaultNetwork?: string;
  defaultWallets?: Wallet[],
}

export default class BurnerProvider extends EventEmitter {
  public isBurnerProvider = true;
  public hub: HubBridge;
  public connected = false;
  public walletBridge: WalletBridge | null = null;
  public wallet: any = null;
  public network: string;
  private _nextJsonRpcId = 0;
  private walletSelector = new WalletSelector();
  private defaultWallets: Wallet[] = [];

  constructor({
    hubUrl = 'https://burnerconnect.xyz/',
    defaultNetwork = '1',
    defaultWallets = [],
  }: ConstructorProps = {}) {
    super();
    this.network = defaultNetwork;
    this.hub = new HubBridge(hubUrl);
    this.defaultWallets = defaultWallets;

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

    return new Promise(async (resolve, reject) => {
      this.walletSelector.onClose(() => {
        this.walletSelector.close();
        reject();
      });

      try {
        this.walletSelector.showStarting();
        await this.showPrompt();

        if (await this.needsPopup()) {
          await this.showPopup();
        }

        this.walletBridge = new WalletBridge(this.wallet.origin);
        await this.walletBridge.ensureIFrame();

        this.getBridge().send({
          id: id(),
          method: 'eth_accounts',
          network: this.network,
        });

        this.connected = true;
        this.emit('connect');
        resolve();
      } catch (e) {
        console.error(e);
        reject();
      } finally {
        this.walletSelector.close();
      }
    });
  }

  async showPrompt() {
    const wallet = await this.walletSelector.showSelector(this.hub, this.defaultWallets);
    this.walletSelector.showConnecting(wallet.name);
    this.wallet = wallet;
  }

  async needsPopup() {
    const login = new WalletLogin(this.wallet.origin);
    const needsPopup = await login.needsPopup();
    login.remove();
    return needsPopup;
  }

  async showPopup() {
    const login = new WalletLogin(this.wallet.origin);
    await login.showPopup(this.walletSelector.getPanel());
    login.remove();
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