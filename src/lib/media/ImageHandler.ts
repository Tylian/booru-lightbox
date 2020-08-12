import DomBuilder from '../utils/DomBuilder';
import Point from "../utils/Point";
import MediaHandler from './MediaHandler';
import Lightbox from '../Lightbox';

const SUPPORTED = ['jpg', 'png', 'gif', 'jpeg'];
export default class ImageHandler extends MediaHandler {
  static supports(extension: string): boolean {
    return SUPPORTED.includes(extension);
  }

  static preload(url: string) {
    (new Image()).src = url;
  }

  private poll: number;
  private scale = 1;
  private offset = new Point(0, 0);
  private position = new Point(0, 0);
  private start = new Point(0, 0);
  private dragging = false;
  private fullsize = false;

  private image: HTMLImageElement;

  constructor(lightbox: Lightbox, url: string) {
    super(lightbox, url);

    this.shade.addEventListener('mousemove', this.handleDrag.bind(this) as EventListener);
    window.addEventListener('resize', () => this.reset(), false);

    this.image = DomBuilder.create('img')
      .attr({
        "id": "lightbox_content",
        "dragable": false,
        "src": url
      }).on("click", evt => {
        evt.preventDefault();
        evt.stopPropagation();
      }).on("load", () => {
        window.clearTimeout(this.poll);
        this.reset();
        this.image.classList.add('shown');
      }).on("wheel", evt => {
        if (evt.deltaY > 0) {
          this.scale /= 1.12;
        } else if (evt.deltaY < 0) {
          this.scale *= 1.12;
        }
        this.update();
        evt.preventDefault();
      }).on("mousedown", evt => {
        this.start = new Point(evt.clientX, evt.clientY);
        this.dragging = true;
        evt.preventDefault();
      }).on("mouseup", evt => {
        this.commitMove();
        evt.preventDefault();
      }).on("dblclick", evt => {
        this.fullsize = !this.fullsize;
        this.scale = this.fullsize ? 1 : this.calculateScale();
        this.update();

        evt.preventDefault();
      }).build();
    
    this.shade.appendChild(this.image);
    this.poll = window.setTimeout(() => {
      this.pollFunction()
    }, this.settings.poll_interval);
  }

  destroy() {
    window.clearTimeout(this.poll);
    window.removeEventListener('resize', this.reset, false);
    this.shade.removeChild(this.image);
    this.shade.removeEventListener('mousemove', this.handleDrag as EventListener);

    delete this.image;
  }

  handleDrag(e: MouseEvent) {
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

  update(instant = false) {
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