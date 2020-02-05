export default class HubBridge {
  private iframe: any = null;
  private url: string;
  private msgId = 0;

  constructor(url: string) {
    this.url = url;
  }

  ensureIFrame() {
    if (this.iframe) {
      return Promise.resolve(this.iframe);
    }

    return new Promise((resolve) => {
      this.iframe = document.createElement('iframe');
      this.iframe.src = this.url;
      this.iframe.style.cssText = 'height:0; width:0; border:none';
      this.iframe.addEventListener('load', () => resolve());

      document.body.appendChild(this.iframe);
    });
  }

  getFrame(defaultWallets?: any[]) {
    this.iframe = document.createElement('iframe');

    let url = `${this.url}/selector.html`;
    if (defaultWallets && defaultWallets.length > 0) {
      url += `#wallets=${encodeURIComponent(JSON.stringify(defaultWallets))}`;
    }
    this.iframe.src = url;

    this.iframe.style.border = 'none';
    this.iframe.sandbox = 'allow-storage-access-by-user-activation allow-scripts allow-same-origin';

    window.addEventListener('message', (e: any) => {
      console.log(e.data);
      if (e.data.message === 'setHeight') {
        this.iframe.style.height = `${e.data.height}px`;
      }
    });

    return this.iframe;
  }

  awaitSelection(): Promise<any> {
    return new Promise((resolve) => {
      window.addEventListener('message', (e: any) => {
        if (e.data.message === 'walletSelected') {
          resolve(e.data.wallet);
        }
      });
    });
  }

  send(command: string) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      const listener = (e: any) => {
        if (e.data.id === id) {
          window.removeEventListener('message', listener);
          if (e.data.error) {
            reject(e.data.error);
          } else {
            resolve(e.data.response);
          }
        }
      }
      window.addEventListener('message', listener);
      this.iframe.contentWindow.postMessage({ command, id }, this.url);
    });
  }
}
