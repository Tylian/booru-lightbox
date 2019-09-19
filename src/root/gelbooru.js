class Gelbooru extends BooruLightbox {
  constructor() {
    super("Gelbooru");
  }

  initEvents() {
    super.initEvents();
    document.addEventListener("click", e => {
      if (e.ctrlKey || e.shiftKey || e.button != 0) return true;
      if (!e.target.matches(".thumb:not(.blacklisted-image) > a > img")) return true;
      e.preventDefault();

      let el = e.target.parentNode;
      this.showLightbox(el.getAttribute("id").replace(/\D/, ""));

      return false;
    }, true);
  }

  async fetchImageURL(id) {
    return this.settings.gelbooru.use_api
      ? this.apiFetchImageUrl(id)
      : this.scrapeImageUrl(id);
  }

  async scrapeImageUrl(id) {
    let response = await fetch(`${window.location.origin}/index.php?page=post&s=view&id=${id}`);
    let parser = new DOMParser();
    let doc = parser.parseFromString(await response.text(), "text/html");

    var post = doc.querySelector('meta[property="og:image"]');
    return post.getAttribute('content');
  }

  async apiFetchImageUrl(id) {
    let response = await fetch(`${window.location.origin}/index.php?page=dapi&s=post&q=index&id=${id}`);
    let parser = new DOMParser();
    let xmldoc = parser.parseFromString(await response.text(), "text/xml");

    var post = xmldoc.getElementsByTagName('post')[0];
    return post.getAttribute('file_url');
  }

  async getNextId(id) {
    let target = document.querySelector(`.thumb[id$='${id}']`);
    let nodes = Array.from(document.querySelectorAll(`.thumb:not(.blacklisted-image)`));
    let next = nodes.indexOf(target);

    if (next < 0 || next >= nodes.length - 1)
      return null;
    return nodes[next + 1].id.replace(/\D/g, "");
  }

  async getPreviousId(id) {
    let target = document.querySelector(`.thumb[id$='${id}']`);
    let nodes = Array.from(document.querySelectorAll(`.thumb:not(.blacklisted-image)`));
    let previous = nodes.indexOf(target);

    if (previous < 1 || previous >= nodes.length)
      return null;
    return nodes[previous - 1].id.replace(/\D/g, "");
  }
}

new Gelbooru();