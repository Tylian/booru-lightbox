import DomBuilder from './utils/DomBuilder';
import MiniEvent from './utils/MiniEvent';

import * as mediaHandlers from './media/handlers';
import MediaHandler from './media/MediaHandler';

import "../css/lightbox.scss";

export interface ISettings {
  poll_interval: number;
}

interface Events {
  change: (next: boolean) => void;
}

export default class Lightbox extends MiniEvent<Events> {
  private locked = false;
  private visible = false;

  private handler?: MediaHandler = undefined;

  public shade = DomBuilder.create("div")
    .attr("id", "lightbox_shade")
    .on("click", () => { this.hide() })
    .build();

  constructor(public settings: ISettings) {
    super();

    document.body.appendChild(this.shade);

    window.addEventListener("keydown", e => {
      if (!this.visible) return true;
      if (!["ArrowLeft", "ArrowRight".includes(e.key)]) return true;
      e.preventDefault();
      e.stopPropagation();

      this.emit("change", e.key == "ArrowRight");
    }, true);
  }

  supports(extension: string) {
    return Object.values(mediaHandlers).some(handler => (
      handler.supports(extension)
    ));
  }

  load(url: string) {
    this.destroy();

    let extension = url.slice(url.lastIndexOf(".") + 1);
    const Handler = Object.values(mediaHandlers).find(handler => (
      handler.supports(extension)
    ));

    if(!Handler) {
      return false;
    }

    this.handler = new Handler(this, url);
  }

  preload(url: string) {
    let extension = url.slice(url.lastIndexOf(".") + 1);
    const Handler = Object.values(mediaHandlers).find(handler => (
      handler.supports(extension)
    ));

    if(!Handler) {
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
