class Ouroboros extends BooruLightbox {
  constructor() {
    super("Ouroboros");
  }

  initEvents() {
    super.initEvents();
    document.addEventListener("click", e => {
      if (e.ctrlKey || e.shiftKey || e.button != 0) return true;
      if (!e.target.matches(".thumb:not(.blacklisted) > a > img")) return true;
      e.preventDefault();

      let el = e.target.parentNode.parentNode;
      this.showLightbox(el.getAttribute("id").replace(/\D/, ""));

      return false;
    }, true);
  }

  async fetchImageURL(id) {
    let response = await fetch(`${window.location.origin}/post/show.json?id=${id}`);
    let data = await response.json();
    return data["file_url"];
  }

  async getNextId(id) {
    let target = document.querySelector(`.thumb[id$='${id}']`);
    let nodes = Array.from(document.querySelectorAll(`.thumb:not(.blacklisted)`));
    let next = nodes.indexOf(target);

    if (next < 0 || next >= nodes.length - 1)
      return null;
    return nodes[next + 1].id.replace(/\D/g, "");
  }

  async getPreviousId(id) {
    let target = document.querySelector(`.thumb[id$='${id}']`);
    let nodes = Array.from(document.querySelectorAll(`.thumb:not(.blacklisted)`));
    let previous = nodes.indexOf(target);

    if (previous < 1 || previous >= nodes.length)
      return null;
    return nodes[previous - 1].id.replace(/\D/g, "");
  }
}

new Ouroboros();