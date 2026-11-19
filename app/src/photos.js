// The photos a cover can use: the two sample photos shipped with the app,
// then any photo the person adds from their own machine. Photos are read in
// the browser and never leave it; an uploaded file becomes an object URL and
// is only ever drawn onto the cover canvas.

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('could not load image'));
    img.src = url;
  });
}

/**
 * The photo shelf. `list` holds the loaded images in order; index 0 and 1
 * are the shipped samples. `addFile` reads a File the person picked or
 * dropped and appends it, returning its index.
 */
export class PhotoShelf {
  constructor() {
    this.list = [];
    this.names = [];
  }

  async loadSamples() {
    const samples = [
      ['samples/boulevard.jpg', 'Boulevard sample'],
      ['samples/pier.jpg', 'Pier sample'],
    ];
    for (const [url, name] of samples) {
      this.list.push(await loadImage(url));
      this.names.push(name);
    }
    return this.list.length;
  }

  async addFile(file) {
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      this.list.push(img);
      this.names.push(file.name);
      return this.list.length - 1;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}
