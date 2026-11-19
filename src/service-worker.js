/**
 * Nemo's World service worker: keeps a copy of the app on the phone so it opens
 * and works without an internet connection.
 *
 * This file is a template. `npm run build` fills in the three placeholders below
 * with the exact list of app files and photos (see serviceWorker() in
 * vite.config.ts) and publishes the result as /sw.js.
 *
 * - App files (page, code, styles, font, icons) are saved when the app is first
 *   opened, so everything except unseen photos works offline straight away.
 * - Photos are saved as they're viewed, so photos you've seen show offline too.
 * - Pages are fetched fresh when online (so updates arrive), and served from the
 *   saved copy when offline.
 * - Diary entries and appointments don't go through here at all: they're saved
 *   on the phone by the app itself.
 */

const VERSION = '__SW_VERSION__';
const PRECACHE = __SW_PRECACHE__;
const PHOTOS = __SW_PHOTOS__;

const APP_CACHE = `nemos-world-app-${VERSION}`;
const PHOTO_CACHE = 'nemos-world-photos';
const PAGE = '/index.html';
const NETWORK_TIMEOUT_MS = 4000;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(APP_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Remove app files from older versions.
      for (const key of await caches.keys()) {
        if (key.startsWith('nemos-world-app-') && key !== APP_CACHE) await caches.delete(key);
      }
      // Remove saved photos that are no longer part of the app.
      const current = new Set(PHOTOS);
      const photos = await caches.open(PHOTO_CACHE);
      for (const request of await photos.keys()) {
        if (!current.has(new URL(request.url).pathname)) await photos.delete(request);
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(pageFromNetworkOrSavedCopy(request));
  } else if (url.pathname.endsWith('.webp')) {
    event.respondWith(savedCopyOrNetwork(request, PHOTO_CACHE));
  } else {
    event.respondWith(savedCopyOrNetwork(request, APP_CACHE));
  }
});

/** Pages: try the network (with a time limit), fall back to the saved app page. */
async function pageFromNetworkOrSavedCopy(request) {
  try {
    const response = await fetchWithTimeout(request, NETWORK_TIMEOUT_MS);
    if (response.ok) {
      const cache = await caches.open(APP_CACHE);
      await cache.put(PAGE, response.clone());
    }
    return response;
  } catch {
    return (await caches.match(PAGE)) ?? Response.error();
  }
}

/** Files and photos: use the saved copy if there is one, otherwise download and save it. */
async function savedCopyOrNetwork(request, cacheName) {
  const saved = await caches.match(request);
  if (saved) return saved;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return Response.error();
  }
}

function fetchWithTimeout(request, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(request, { signal: controller.signal }).finally(() => clearTimeout(timer));
}
