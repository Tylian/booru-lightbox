import { h } from '../Utils';
import MediaHandler from './MediaHandler';

const SUPPORTED = ['webm', 'mp4'];
export default class MovieHandler extends MediaHandler {
  static supports(extension) {
    return SUPPORTED.includes(extension);
  }

  constructor(lightbox, url) {
    super(lightbox, url);

    this.movie = h('video#lightbox_content.fit-size', {
      autoplay: true,
      loop: true,
      controls: true,
      src: url,
      oncanplay: () => {
        this.movie.classList.add('shown');
      }
    });

    this.shade.appendChild(this.movie);
  }

  destroy() {
    this.shade.removeChild(this.movie);
    delete this.movie;
  }
}