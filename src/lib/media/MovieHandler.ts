import DomBuilder from '../utils/DomBuilder';
import MediaHandler from './MediaHandler';
import Lightbox from '../Lightbox';

const SUPPORTED = ['webm', 'mp4'];
export default class MovieHandler extends MediaHandler {
  static supports(extension: string) {
    return SUPPORTED.includes(extension);
  }

  private movie: HTMLVideoElement;

  constructor(lightbox: Lightbox, url: string) {
    super(lightbox, url);

    this.movie = DomBuilder.create("video")
      .attr({
        "autoplay": true,
        "loop": true,
        "controls": true,
        "src": url
      }).on("canplay", () => {
        this.movie.classList.add('shown');
      }).build();

    this.shade.appendChild(this.movie);
  }

  destroy() {
    this.shade.removeChild(this.movie);
    delete this.movie;
  }
}