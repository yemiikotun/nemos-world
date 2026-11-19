import { readFileSync, readdirSync } from 'node:fs';
import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { imagetools } from 'vite-imagetools';
import { buildServiceWorker } from './scripts/service-worker-build';

/** At build time, publish /sw.js: the offline service worker with this build's file list filled in. */
function serviceWorker(): Plugin {
  return {
    name: 'nemos-world-service-worker',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const template = readFileSync('src/service-worker.js', 'utf8');
      const publicFiles = readdirSync('public').filter((file) => !file.startsWith('.'));
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: buildServiceWorker(template, Object.keys(bundle), publicFiles),
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    // imagetools resizes Nemo's photos at build time (see src/lib/photos.ts).
    // Case-insensitive so iPhone-style "IMG_1234.JPG" files are resized too.
    imagetools({ include: /^[^?]+\.(avif|gif|heif|jpe?g|png|tiff|webp)(\?.*)?$/i }),
    serviceWorker(),
  ],
  test: {
    environment: 'node',
  },
});
