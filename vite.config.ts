import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { imagetools } from 'vite-imagetools';

export default defineConfig({
  // imagetools resizes Nemo's photos at build time (see src/lib/photos.ts).
  plugins: [
    react(),
    // Case-insensitive so iPhone-style "IMG_1234.JPG" files are resized too.
    imagetools({ include: /^[^?]+\.(avif|gif|heif|jpe?g|png|tiff|webp)(\?.*)?$/i }),
  ],
  test: {
    environment: 'node',
  },
});
