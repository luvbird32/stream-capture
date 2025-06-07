
export class ChromeExtensionService {
  static isExtension(): boolean {
    return !!(window as any).chrome?.runtime?.id;
  }

  static async getDesktopStream(): Promise<MediaStream> {
    if (!this.isExtension()) {
      throw new Error('Not running in Chrome extension context');
    }

    return new Promise((resolve, reject) => {
      (window as any).chrome.runtime.sendMessage(
        { type: 'getDesktopCapture' },
        (response: any) => {
          if (response.error) {
            reject(new Error(response.error));
            return;
          }

          if (response.streamId) {
            navigator.mediaDevices.getUserMedia({
              audio: {
                mandatory: {
                  chromeMediaSource: 'desktop',
                  chromeMediaSourceId: response.streamId
                }
              } as any,
              video: {
                mandatory: {
                  chromeMediaSource: 'desktop',
                  chromeMediaSourceId: response.streamId,
                  maxWidth: 1920,
                  maxHeight: 1080
                }
              } as any
            })
            .then(resolve)
            .catch(reject);
          } else {
            reject(new Error('No stream ID received'));
          }
        }
      );
    });
  }
}
