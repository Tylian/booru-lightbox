import Lightbox from './Lightbox';
import settings from './settings';

export type ImageId = string | number;

export default class BooruLightbox {
  protected manifest = browser.runtime.getManifest();
  protected settings = settings;
  protected lightbox = new Lightbox(this.settings.lightbox);
  protected currentId: ImageId = "";
  protected imageCache = new Map<ImageId, string>();
  protected preloadCache = new Set<ImageId>();

  constructor(site: string) {
    this.log("Starting up version:", this.manifest.version);
    this.log("Detected:", site);
    this.initEvents();
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

  async fetchImageURL(id: ImageId): Promise<string> {
    throw new Error("fetchImageURL not implemented on child class!");
  }
  async getNextId(id: ImageId): Promise<ImageId | null> {
    throw new Error("getNextId not implemented on child class!");
  }
  async getPreviousId(id: ImageId): Promise<ImageId | null> {
    throw new Error("getPreviousId not implemented on child class!");
  }

  async fetchImageCache(id: ImageId) {
    if (this.imageCache.has(id)) {
      return this.imageCache.get(id);
    } else {
      let url = await this.fetchImageURL(id);
      let extension = url.slice(url.lastIndexOf(".") + 1);
      if (!this.lightbox.supports(extension)) {
        url = browser.runtime.getURL("assets/unsupported.png");
      }

      this.imageCache.set(id, url);
      return url;
    }
  }

  async showLightbox(id: ImageId) {
    this.lightbox.show();
    let url = await this.fetchImageCache(id);
    this.currentId = id;

    if(url !== undefined) {
      this.lightbox.load(url);
    }

    if (this.settings.preload) {
      this.preloadId(await this.getNextId(id));
      this.preloadId(await this.getPreviousId(id));
    }
  }

  async preloadId(id: ImageId | null) {
    if (id === null || this.preloadCache.has(id)) return;
    let url = await this.fetchImageCache(id);
    
    if(url !== undefined) {
      this.preloadCache.add(id);
      this.lightbox.preload(url);
    }
  }

  debug(...args: any[]) {
    if (this.settings.debug) {
      this.log(...args);
    }
  }

  log(...args: any[]) {
    console.log(...[`[${this.manifest.name}]`, ...args]);
  }
}
