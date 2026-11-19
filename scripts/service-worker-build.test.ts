import { describe, expect, it } from 'vitest';
import { buildServiceWorker } from './service-worker-build';

const template = "const VERSION = '__SW_VERSION__';\nconst PRECACHE = __SW_PRECACHE__;\nconst PHOTOS = __SW_PHOTOS__;";
const bundle = ['index.html', 'assets/index-abc.js', 'assets/index-def.css', 'assets/nunito-latin.woff2', 'assets/nap-111.webp', 'assets/nap-222.webp'];
const pub = ['icon-192.png', 'manifest.webmanifest'];

const parse = (source: string) => {
  const grab = (name: string) => JSON.parse(source.match(new RegExp(`const ${name} = (.*);`))![1]);
  return { version: source.match(/VERSION = '(\w+)'/)![1], precache: grab('PRECACHE') as string[], photos: grab('PHOTOS') as string[] };
};

describe('buildServiceWorker', () => {
  it('saves the app files up front and lists photos separately', () => {
    const { precache, photos } = parse(buildServiceWorker(template, bundle, pub));
    expect(precache).toEqual([
      '/assets/index-abc.js', '/assets/index-def.css', '/assets/nunito-latin.woff2',
      '/icon-192.png', '/index.html', '/manifest.webmanifest',
    ]);
    expect(photos).toEqual(['/assets/nap-111.webp', '/assets/nap-222.webp']);
  });

  it('changes the version when any file changes, and only then', () => {
    const a = parse(buildServiceWorker(template, bundle, pub)).version;
    expect(parse(buildServiceWorker(template, bundle, pub)).version).toBe(a);
    expect(parse(buildServiceWorker(template, [...bundle, 'assets/new-333.webp'], pub)).version).not.toBe(a);
  });

  it('fails loudly if the template is missing a placeholder', () => {
    expect(() => buildServiceWorker('nothing here', bundle, pub)).toThrow(/missing/);
  });
});
