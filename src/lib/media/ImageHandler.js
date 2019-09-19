import { h } from '../Utils';
import MediaHandler from './MediaHandler';

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  add(other) {
    return new Point(this.x + other.x, this.y + other.y);
  }
}

const SUPPORTED = ['jpg', 'png', 'gif', 'jpeg'];
export default class ImageHandler extends MediaHandler {
  static supports(extension) {
    return SUPPORTED.includes(extension);
  }

  static preload(url) {
    (new Image()).src = url;
  }

  constructor(lightbox, url) {
    super(lightbox, url);

    this.poll = false;
    this.scale = 1;
    this.offset = new Point(0, 0);
    this.position = new Point(0, 0);
    this.start = new Point(0, 0);
    this.dragging = false;
    this.fullsize = false;

    // >_>
    this.handleDrag = this.handleDrag.bind(this);
    this.reset = this.reset.bind(this);

    this.shade.addEventListener('mousemove', this.handleDrag.bind(this));
    window.addEventListener('resize', this.reset.bind(this), false);

    this.image = h('img#lightbox_content', {
      draggable: false,
      src: url,
      onclick(e) {
        e.preventDefault();
        e.stopPropagation();
      },
      onload: () => {
        window.clearTimeout(this.poll);
        this.reset();
        this.image.classList.add('shown');
      },
      onwheel: e => {
        if (e.deltaY > 0) {
          this.scale /= 1.12;
        } else if (e.deltaY < 0) {
          this.scale *= 1.12;
        }
        this.update();
        e.preventDefault();
      },
      onmousedown: e => {
        this.start = new Point(e.clientX, e.clientY);
        this.dragging = true;
        e.preventDefault();
      },
      onmouseup: e => {
        this.commitMove();
        e.preventDefault();
      },
      ondblclick: e => {
        this.fullsize = !this.fullsize;
        this.scale = this.fullsize ? 1 : this.calculateScale();
        this.update();

        e.preventDefault();
      }
    });

    this.shade.appendChild(this.image);

    this.poll = window.setTimeout(this.pollFunction.bind(this), this.settings.pollInterval);
  }

  destroy() {
    window.clearTimeout(this.poll);
    window.removeEventListener('resize', this.reset, false);
    this.shade.removeChild(this.image);
    this.shade.removeEventListener('mousemove', this.handleDrag);

    delete this.image;
  }

  handleDrag(e) {
    if (e.buttons == 0) {
      this.commitMove();
    } else if (this.dragging) {
      this.offset.x = e.clientX - this.start.x;
      this.offset.y = e.clientY - this.start.y;
      this.update();
    }
  }

  pollFunction() {
    if (this.image.naturalWidth && this.image.naturalHeight) {
      this.reset();
      this.image.classList.add('shown');
    } else {
      this.poll = window.setTimeout(this.pollFunction.bind(this), this.settings.poll_interval);
    }
  }

  reset() {
    this.position = new Point(0, 0);
    this.offset = new Point(0, 0);
    this.dragging = false;

    this.scale = this.calculateScale();
    this.fullsize = false;
    this.update(true);
  }

  update(instant) {
    if (instant) {
      this.image.classList.add('no-transition');
    }
    this.image.style.left = `${this.position.x + this.offset.x}px`;
    this.image.style.top = `${this.position.y + this.offset.y}px`;
    this.image.style.transform = `scale(${this.scale})`;
    if (instant) {
      this.image.offsetHeight; // hack: force reflow to apply no transition
      this.image.classList.remove('no-transition');
    }
  }

  calculateScale() {
    var width = this.image.naturalWidth;
    var height = this.image.naturalHeight;

    var scale = 1;

    if (width > window.innerWidth || height > window.innerHeight) {
      scale = Math.min(window.innerWidth / width, window.innerHeight / height);
    }

    return scale;
  }

  /* private */
  commitMove() {
    this.position = this.position.add(this.offset);
    this.offset = new Point(0, 0);
    this.dragging = false;
  }
}