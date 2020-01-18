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

function populateList(wallets: any[], list: HTMLUListElement, resolve: (wallet: any) => void) {
  for (const wallet of wallets) {
    const item = document.createElement('li');
    item.addEventListener('click', () => resolve(wallet.origin));
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
`;

    const panel = document.createElement('div');
    panel.style.cssText = `
  display: flex;
  flex-direction: column;
  padding: 8px;
  margin: 8px;
  border-radius: 8px;
  background: #ffffff;
`;
    container.appendChild(panel);

    const header = document.createElement('h1');
    header.innerHTML = 'Select a Burner Wallet to connect to';
    container.appendChild(header);

    const list = document.createElement('ul');
    populateList(wallets, list, (wallet: any) => resolve(wallet));
    container.appendChild(list);

    const cancel = document.createElement('button');
    cancel.innerHTML = 'Cancel';
    cancel.addEventListener('click', reject);
    container.appendChild(cancel);

    document.body.appendChild(container);
  });
}
