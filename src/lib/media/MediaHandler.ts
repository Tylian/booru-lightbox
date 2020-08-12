import Lightbox, { ISettings } from "../Lightbox";

export default class MediaHandler {
  static supports(extension: string): boolean {
    return false;
  }

  static preload(url: string): void {
    // noop
  }

  protected settings: ISettings;
  protected shade: Node;

  constructor(public lightbox: Lightbox, url: string) {
    this.settings = lightbox.settings;
    this.shade = lightbox.shade;
  }

  destroy() {
    // noop
  }
}