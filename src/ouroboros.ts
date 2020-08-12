import BooruLightbox, { ImageId } from "./lib/BooruLightbox";

class Ouroboros extends BooruLightbox {
  constructor() {
    super("Ouroboros");
  }

  initEvents() {
    super.initEvents();
    document.addEventListener("click", e => {
      if (e.ctrlKey || e.shiftKey || e.button != 0) return true;

      const target: HTMLElement = (e.target as HTMLElement).closest(".post-preview:not(.blacklisted-active)");
      if (target == null) return true;
      e.preventDefault();

      let id = target.getAttribute("data-id");
      if(id !== null) {
        this.showLightbox(id.replace(/\D/, ""));
      }
      
      return false;
    }, true);
  }

  async fetchImageURL(id: ImageId) {
    let response = await fetch(`${window.location.origin}/posts/${id}.json?client=BooruLightbox (by cute-kitsune)`);
    let data = await response.json();
    console.log(data);
    return data["post"]["file"]["url"];
  }

  async getNextId(id: ImageId) {
    let target = document.querySelector(`.post-preview[data-id$='${id}']`);
    let nodes = Array.from(document.querySelectorAll(`.post-preview:not(.blacklisted-active)`));
    
    if(target == undefined)
      return null;

    let next = nodes.indexOf(target);

    if (next < 0 || next >= nodes.length - 1)
      return null;
    return nodes[next + 1].id.replace(/\D/g, "");
  }

  async getPreviousId(id: ImageId) {
    let target = document.querySelector(`.post-preview[data-id$='${id}']`);
    let nodes = Array.from(document.querySelectorAll(`.post-preview:not(.blacklisted-active)`));

    if(target == undefined)
      return null;

    let previous = nodes.indexOf(target);

    if (previous < 1 || previous >= nodes.length)
      return null;
    return nodes[previous - 1].id.replace(/\D/g, "");
  }
}

new Ouroboros();