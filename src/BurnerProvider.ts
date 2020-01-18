import HubBridge from './HubBridge';

export default class BurnerProvider {
  public hub: HubBridge;
  public connected = false;


  constructor(hubUrl = 'http://burnerconnect.xyz/') {
    this.hub = new HubBridge(hubUrl);
  }

  activate() {
    if (this.connected) {
      return Promise.resolve();
    }

    return this.hub.getWallets()
      .then((wallets: any[]) => this.showPrompt(wallets));
  }


  showPrompt(wallets: any[]) {
    //
  }
}