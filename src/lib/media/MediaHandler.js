export default class MediaHandler {
  static supports(extension) {
    return false;
  }

  static preload(url) {
    // noop
  }

  constructor(lightbox, url) {
    this.lightbox = lightbox;
    this.settings = lightbox.settings;
    this.shade = lightbox.shade;
  }

  destroy() {
    // noop
  }
}