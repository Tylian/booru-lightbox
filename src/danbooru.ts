import BooruLightbox, { ImageId } from "./lib/BooruLightbox";

class Danbooru extends BooruLightbox {
  constructor() {
    super("Danbooru");
  }

  initEvents() {
    super.initEvents();
    document.addEventListener("click", e => {
      if (e.ctrlKey || e.shiftKey || e.button != 0) return true;

      const target: HTMLElement = e.target as HTMLElement;
      if (!target.matches(".post-preview:not(.blacklisted-active) > a img")) return true;
      e.preventDefault();

      let el = target.closest('.post-preview:not(.blacklisted-active)');
      if (el !== null && el.hasAttribute("data-id")) {
        let id = el.getAttribute("data-id");
        if(id !== null) {
          this.showLightbox(id);
        }
      }

      return false;
    }, true);
  }

  async fetchImageURL(id: ImageId) {
    let response = await fetch(`${window.location.origin}/posts/${id}.json`, { credentials: "include" });
    let data = await response.json();

    return data['file_url'];
  }

  async getNextId(id: ImageId) {
    let target = document.querySelector(`.post-preview[data-id$='${id}']`);
    let nodes = Array.from(document.querySelectorAll(`.post-preview:not(.blacklisted-active)`));

    if(target == undefined)
      return null;

    let next = nodes.indexOf(target);

    if (next < 0 || next >= nodes.length - 1)
      return null;
    return nodes[next + 1].getAttribute("data-id");
  }

  async getPreviousId(id: ImageId) {
    let target = document.querySelector(`.post-preview[data-id$='${id}']`);
    let nodes = Array.from(document.querySelectorAll(`.post-preview:not(.blacklisted-active)`));

    if(target == undefined)
      return null;

    let previous = nodes.indexOf(target);

    if (previous < 1 || previous >= nodes.length)
      return null;
    return nodes[previous - 1].getAttribute("data-id");
  }
}

new Danbooru();
