export default class WalletLogin {
  public origin: string;
  private iframe: any = null;
  private msgId = 0;

  constructor(origin: string) {
    this.origin = origin;
  }

  createIframe(visible: boolean = false) {
    this.iframe = document.createElement('iframe');
    this.iframe.src = `${this.origin}/burnerconnect-login.html`;
    this.iframe.style.cssText = visible ? 'border:none; width: 100%' : 'height:0; width:0; border:none; position: absolute';

    if (visible) {
      const resizeListener = (e: any) => {
        if (e.data.message === 'setSize') {
          this.iframe.style.height = `${e.data.height}px`;
        }
      }
      window.addEventListener('message', resizeListener);
    }
    return this.iframe;
  }

  needsPopup(): Promise<boolean> {
    return new Promise((resolve) => {
      const iframe = this.createIframe();
      window.addEventListener('message', (e: any) => {
        if (e.data.message === 'needsPopup') {
          resolve(true);
        } else if (e.data.message === 'ready') {
          resolve(false);
        }
      });
      document.body.appendChild(iframe);
    });
  }

  showPopup(container: any): Promise<void> {
    return new Promise((resolve) => {
      const iframe = this.createIframe(true);
      window.addEventListener('message', (e: any) => {
        if (e.data.message === 'ready') {
          resolve();
        }
      });
      container.appendChild(iframe);
    });
  }

  getFrame() {
    if (!this.iframe) {
      throw new Error('No iframe');
    }
    return this.iframe;
  }

  remove() {
    const frame = this.getFrame();
    frame.parentNode.removeChild(frame);
  }
}
