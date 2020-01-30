export default class HubBridge {
  public origin: string;
  private iframe: any = null;
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
    if (this.iframe) {
      return Promise.resolve(this.iframe);
    }

    return new Promise((resolve) => {
      this.iframe = document.createElement('iframe');
      this.iframe.src = `${this.origin}/burnerconnect.html`;
      this.iframe.style.cssText = 'height:0; width:0; border:none';
      this.iframe.addEventListener('load', () => resolve());

      document.body.appendChild(this.iframe);
    });
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
}
