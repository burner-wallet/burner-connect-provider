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
    list.appendChild(item);
  }
}

export default function showWalletSelector(wallets: any[]) {
  return new Promise((resolve, reject) => {
    if (container) {
      return reject(new Error('Selector already visible'));
    }

    container = document.createElement('div');
    container.style.cssText = `
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(200, 200, 200, 0.5);
  z-index: 100;
  align-items: center;
`;

    const panel = document.createElement('div');
    panel.style.cssText = `
  display: flex;
  flex-direction: column;
  padding: 8px;
  margin: 8px;
  border-radius: 8px;
  background: #ffffff;
  max-width: 500px;
`;
    container.appendChild(panel);

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
      populateList(wallets, list, (wallet: any) => {
        document.body.removeChild(container!);
        container = null;
        resolve(wallet);
      });
      panel.appendChild(list);
    }

    const cancel = document.createElement('button');
    cancel.innerHTML = 'Cancel';
    cancel.addEventListener('click', () => {
      document.body.removeChild(container!);
      container = null;
      reject();
    });
    panel.appendChild(cancel);

    document.body.appendChild(container);
  });
}
