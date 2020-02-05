import { Wallet } from './BurnerProvider';
import HubBridge from './HubBridge';

let container: HTMLDivElement | null = null;

function setNormalListStyle(item: HTMLLIElement) {
  item.style.cssText = `
    background: #FFFFFF;
    border-bottom: solid 1px #DDDDDD;
    padding: 4px 0;
    list-style: none;
  `;
}

function setHoverListStyle(item: HTMLLIElement) {
  item.style.cssText = `
    background: #EEEEEE;
    border-bottom: solid 1px #DDDDDD;
    cursor: pointer;
    padding: 4px 0;
    list-style: none;
  `;
}

function populateList(wallets: any[], list: HTMLUListElement, onClick: (wallet: any) => void) {
  for (const wallet of wallets) {
    const item = document.createElement('li');
    item.innerHTML = `<div>${wallet.name}</div><div style="color: #555555">${wallet.origin}</div>`;

    item.addEventListener('click', () => onClick(wallet));
    setNormalListStyle(item);
    item.addEventListener('mouseover', (e: any) => setHoverListStyle(e.currentTarget));
    item.addEventListener('mouseout', (e: any) => setNormalListStyle(e.currentTarget));
    list.appendChild(item);
  }
}

export default class WalletSelector {
  private container: any;
  private panel: any;
  private closeListeners: any[] = [];

  getPanel() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.style.cssText = `
        display: flex;
        flex-direction: column;
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(200, 200, 200, 0.5);
        z-index: 10000001;
        align-items: center;
      `;
      document.body.appendChild(this.container);
    }
    if (!this.panel) {
      const outer = document.createElement('div');
      outer.style.cssText = `
        display: flex;
        flex-direction: column;
        padding: 8px;
        margin: 8px;
        border-radius: 8px;
        background: #ffffff;
        max-width: 500px;
      `;

      const close = document.createElement('button');
      close.innerText = 'x';
      close.style.cssText = `
        margin-left: auto;
      `;
      close.addEventListener('click', () => this.closeListeners.forEach(listener => listener()));
      outer.appendChild(close);

      const content = document.createElement('div');
      outer.appendChild(content);

      this.panel = content;
      this.container.appendChild(outer);
    }
    return this.panel;
  }

  showStarting() {
    const panel = this.getPanel();
    panel.innerHTML = '<h2>Fetching your Burner Wallets...</h2>';
  }

  showSelector(bridge: HubBridge, defaultWallets?: Wallet[]) {
    const panel = this.getPanel();
    panel.appendChild(bridge.getFrame(defaultWallets));

    return bridge.awaitSelection();
  }

  showFrame(iframe: any) {
    const panel = this.getPanel();
    panel.innerHTML = '';
    iframe.style.height = '100px';
    iframe.style.width = '100px';
    panel.appendChild(iframe);
  }

  showConnecting(wallet: string) {
    const panel = this.getPanel();
    panel.innerHTML = `<h2>Connecting to ${wallet}...</h2>`;
  }

  close() {
    document.body.removeChild(this.container!);
    this.container = null;
    this.panel = null;
  }

  onClose(listener: any) {
    this.closeListeners.push(listener);
  }
}
