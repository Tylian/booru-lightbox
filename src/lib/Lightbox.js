import { h, Point } from './Utils';
import MiniEvent from './MiniEvent';

import * as mediaHandlers from './media/handlers.js';

export default class Lightbox extends MiniEvent {
  constructor(settings) {
    super();

    this.locked = false;
    this.visible = false;
    this.settings = settings;

    this.currentHandler = undefined;

    // body.innerHTML += "stuff" explodes e621
    this.shade = h("div#lightbox_shade", {
      onclick: e => {
        this.hide();
      }
    });

    document.body.appendChild(this.shade);

    window.addEventListener("keydown", e => {
      if (!this.visible) return true;
      if (!["ArrowLeft", "ArrowRight".includes(e.key)]) return true;
      e.preventDefault();
      e.stopPropagation();

      this.emit("change", e.key == "ArrowRight");
    }, true);
  }

  supports(extension) {
    return Object.values(mediaHandlers).some(handler => (
      handler.supports(extension)
    ));
  }

  load(url) {
    this.destroy();

    let extension = url.slice(url.lastIndexOf(".") + 1);
    const Handler = Object.values(mediaHandlers).find(handler => (
      handler.supports(extension)
    ));

    if (!Handler) {
      return false;
    }

    this.handler = new Handler(this, url);
  }

  preload(url) {
    let extension = url.slice(url.lastIndexOf(".") + 1);
    const Handler = Object.values(mediaHandlers).find(handler => (
      handler.supports(extension)
    ));

    if (!Handler) {
      return false;
    }

    Handler.preload(url);
  }

  destroy() {
    if (this.handler !== undefined) {
      this.handler.destroy();
      delete this.handler;
    }
  }

  show() {
    if (this.locked || this.visible) return false;
    this.locked = true;
    this.visible = true;

    this.shade.classList.add("front", "shown");
    setTimeout(() => {
      this.locked = false;
    }, 300);
  }

  hide() {
    if (this.locked) return;
    this.locked = true;
    this.visible = false;

    this.shade.classList.remove("shown");
    setTimeout(() => {
      this.shade.classList.remove("front");
      this.destroy();
      this.locked = false;
    }, 300);
  }
}
