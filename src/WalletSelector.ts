let container: HTMLDivElement | null = null;

function setNormalListStyle(item: HTMLLIElement) {
  item.style.cssText = `
    background: #FFFFFF;
    border-bottom: solid 1px #DDDDDD;
    padding: 4px 0;
`;
}

function setHoverListStyle(item: HTMLLIElement) {
  item.style.cssText = `
    background: #EEEEEE;
    cursor: pointer;
`;
}

function populateList(wallets: any[], list: HTMLUListElement, onClick: (wallet: any) => void) {
  for (const wallet of wallets) {
    const item = document.createElement('li');
    item.innerHTML = `${wallet.name} (${wallet.origin})`;
    item.addEventListener('click', () => onClick(wallet));
    setNormalListStyle(item);
    item.addEventListener('mouseOver', (e: any) => setHoverListStyle(e.target));
    item.addEventListener('mouseOut', (e: any) => setNormalListStyle(e.target));
    list.appendChild(item);
  }
}

export default class WalletSelector {
  private container: any;
  private panel: any;

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
      this.panel = document.createElement('div');
      this.panel.style.cssText = `
        display: flex;
        flex-direction: column;
        padding: 8px;
        margin: 8px;
        border-radius: 8px;
        background: #ffffff;
        max-width: 500px;
      `;
      this.container.appendChild(this.panel);
    }
    return this.panel;
  }

  showStarting() {
    const panel = this.getPanel();
    panel.innerHTML = '<h2>Fetching your Burner Wallets...</h2>';
  }

  showSelector(wallets: any[]) {
    return showWalletSelector(wallets, this.getPanel());
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
}

function showWalletSelector(wallets: any[], panel: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const header = document.createElement('h1');
    header.innerHTML = 'Select a Burner Wallet to connect to';
    panel.appendChild(header);

    if (wallets.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.innerHTML = '<h2>No Burner Wallets found</h2>'
        + '<div><a href="https://burnerconnect.burnerfactory.com/" target="_blank">Try out a wallet</a></div>';
      panel.appendChild(emptyState);
    } else {
      const list = document.createElement('ul');
      populateList(wallets, list, (wallet: any) => resolve(wallet));
      panel.appendChild(list);
    }

    const cancel = document.createElement('button');
    cancel.innerHTML = 'Cancel';
    cancel.addEventListener('click', () => reject());
    panel.appendChild(cancel);
  });
}
