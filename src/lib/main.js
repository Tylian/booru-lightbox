import Lightbox from './Lightbox';
import settings from './settings';

export default class BooruLightbox {
  constructor(site) {
    this.manifest = browser.runtime.getManifest();
    this.log("Starting up version:", this.manifest.version);
    this.getSettings().then(settings => {
      this.imageCache = new Map();
      this.preloadCache = new Set();
      this.currentId = "";
      this.settings = settings;

      this.log("Detected:", site);
      this.lightbox = new Lightbox(this.settings.lightbox);
      this.initEvents();
    });
  }

  initEvents() {
    this.lightbox.on("change", async next => {
      let id = await (next ? this.getNextId(this.currentId) : this.getPreviousId(this.currentId));
      if (id === null) {
        this.lightbox.hide();
      } else {
        this.showLightbox(id);
      }
    });
  }

  async getSettings() {
    return settings;
  }

  async fetchImageURL(id) {
    throw new Error("fetchImageURL not implemented on child class!");
  }
  async getNextId(id) {
    throw new Error("getNextId not implemented on child class!");
  }
  async getPreviousId(id) {
    throw new Error("getPreviousId not implemented on child class!");
  }

  async fetchImageCache(id) {
    if (this.imageCache.has(id)) {
      return this.imageCache.get(id);
    } else {
      let url = await this.fetchImageURL(id);
      let extension = url.slice(url.lastIndexOf(".") + 1);
      if (!this.lightbox.supports(extension)) {
        url = browser.runtime.getURL("img/unsupported.png");
      }

      this.imageCache.set(id, url);
      return url;
    }
  }

  async showLightbox(id) {
    this.lightbox.show();
    let url = await this.fetchImageCache(id);
    this.currentId = id;
    this.lightbox.load(url);

    if (this.settings.preload) {
      this.preloadId(await this.getNextId(id));
      this.preloadId(await this.getPreviousId(id));
    }
  }

  async preloadId(id) {
    if (id === null || this.preloadCache.has(id)) return;
    let url = await this.fetchImageCache(id);
    this.preloadCache.add(id);
    this.lightbox.preload(url);
  }

  debug() {
    if (this.settings.debug) this.log(...arguments);
  }

  log() {
    var args = [`[${this.manifest.name}]`, ...arguments];
    console.log(...args);
  }
}