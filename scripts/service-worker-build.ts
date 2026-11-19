import { createHash } from 'node:crypto';

/**
 * Fills in the service worker template (src/service-worker.js) for one build:
 * - PRECACHE: the app files to save when the app is first opened
 *   (page, code, styles, fonts, icons): everything except photos
 * - PHOTOS: every photo file, so photos removed from the app get cleaned up
 * - VERSION: changes whenever any file changes, so phones pick up updates
 *
 * `bundleFiles` are the files Vite produced; `publicFiles` are the files in public/.
 */
export function buildServiceWorker(template: string, bundleFiles: string[], publicFiles: string[]): string {
  const toUrl = (file: string) => `/${file.replace(/^\/+/, '')}`;
  const isPhoto = (file: string) => file.endsWith('.webp');
  const isSourceMap = (file: string) => file.endsWith('.map');

  const photos = bundleFiles.filter(isPhoto).map(toUrl).sort();
  const precache = [
    ...new Set(['/index.html', ...[...bundleFiles, ...publicFiles].filter((f) => !isPhoto(f) && !isSourceMap(f)).map(toUrl)]),
  ].sort();
  const version = createHash('sha256').update(JSON.stringify([precache, photos])).digest('hex').slice(0, 12);

  for (const placeholder of ['__SW_VERSION__', '__SW_PRECACHE__', '__SW_PHOTOS__']) {
    if (!template.includes(placeholder)) throw new Error(`Service worker template is missing ${placeholder}`);
  }
  return template
    .replace('__SW_VERSION__', version)
    .replace('__SW_PRECACHE__', JSON.stringify(precache))
    .replace('__SW_PHOTOS__', JSON.stringify(photos));
}
