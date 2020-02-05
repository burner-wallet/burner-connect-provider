export default class HubBridge {
  public origin: string;
  private iframe: any = null;
  private iframeLoadPromise?: Promise<any>;
  private msgId = 0;

  constructor(origin: string) {
    this.origin = origin;
  }

  async send(payload: any) {
    await this.ensureIFrame();
    const response = await this.sendCommand('send', payload);
    return response;
  }

  ensureIFrame() {
    if (this.iframeLoadPromise) {
      return this.iframeLoadPromise;
    }

    this.iframeLoadPromise = new Promise((resolve) => {
      this.iframe = document.createElement('iframe');
      this.iframe.src = `${this.origin}/burnerconnect-bridge.html`;
      this.iframe.style.cssText = 'height:0; width:0; border:none; position: absolute';
      // this.iframe.addEventListener('load', () => {console.log('loaded');resolve()});
      // this.iframe.sandbox = 'allow-storage-access-by-user-activation allow-scripts allow-same-origin';

      const loadListener = (e: any) => {
        if (e.data.message === 'frameLoaded') {
          window.removeEventListener('message', loadListener);
          resolve(this.iframe);
        }
      }
      window.addEventListener('message', loadListener);

      document.body.appendChild(this.iframe);
    });
    return this.iframeLoadPromise;
  }

  getFrame() {
    if (!this.iframe) {
      throw new Error('No iframe');
    }
    return this.iframe;
  }

  sendCommand(command: string, params?: any) {
    return new Promise((resolve) => {
      const id = this.msgId++;
      const listener = (e: any) => {
        if (e.data.id === id) {
          window.removeEventListener('message', listener);
          resolve(e.data.response);
        }
      }
      window.addEventListener('message', listener);
      this.iframe.contentWindow.postMessage({ command, id, params }, this.origin);
    });
  }

  remove() {
    const frame = this.getFrame();
    frame.parentNode.removeChild(frame);
  }
}
