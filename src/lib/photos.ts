/**
 * Nemo's photos. Every image in src/assets/nemo/ is picked up automatically.
 * At build time each one is resized to 480px and 960px wide WebP versions,
 * so the app never downloads a full-size phone photo.
 */
import { captionFromFileName } from './captions';

export interface Photo {
  /** File name, e.g. "nemo-at-the-beach.jpg" */
  name: string;
  /** A readable caption made from the file name, or null for names like IMG_1234.jpg */
  caption: string | null;
  src: string;
  srcSet: string;
  width: number;
  height: number;
}

interface ImageMetadata {
  src: string;
  width: number;
  height: number;
}

// Vite needs the glob pattern written out literally in each call.
const srcSets = import.meta.glob<string>('../assets/nemo/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}', {
  eager: true,
  import: 'default',
  query: '?w=480;960&format=webp&as=srcset',
});

const fallbacks = import.meta.glob<ImageMetadata>('../assets/nemo/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}', {
  eager: true,
  import: 'default',
  query: '?w=960&format=webp&as=metadata',
});

export const PHOTOS: Photo[] = Object.keys(fallbacks)
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  .map((path) => {
    const name = path.split('/').pop()!;
    const meta = fallbacks[path];
    return {
      name,
      caption: captionFromFileName(name),
      src: meta.src,
      srcSet: srcSets[path],
      width: meta.width,
      height: meta.height,
    };
  });
