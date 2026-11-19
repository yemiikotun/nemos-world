import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite';
import { imagetools } from 'vite-imagetools';
import react from '@vitejs/plugin-react';

/**
 * During `npm run dev`, serve /api/recap from api/recap.ts so the AI recap works
 * locally too. (On Vercel, files in api/ are deployed as serverless functions.)
 */
function localApi(): Plugin {
  return {
    name: 'local-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/recap', async (req, res) => {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);
        const request = new Request(`http://localhost/api/recap`, {
          method: req.method,
          headers: { 'content-type': req.headers['content-type'] ?? 'application/json' },
          body: req.method === 'POST' ? Buffer.concat(chunks) : undefined,
        });
        const api = await server.ssrLoadModule('/api/recap.ts');
        const response: Response = await api.POST(request);
        res.statusCode = response.status;
        response.headers.forEach((value, key) => res.setHeader(key, value));
        res.end(await response.text());
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Let a local .env.local file provide ANTHROPIC_API_KEY to the dev server.
  // (.env files are git-ignored, so the key never ends up on GitHub.)
  const env = loadEnv(mode, process.cwd(), '');
  if (env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY) process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;

  return {
    plugins: [
      react(),
      // Case-insensitive so iPhone-style "IMG_1234.JPG" files are resized too.
      imagetools({ include: /^[^?]+\.(avif|gif|heif|jpe?g|png|tiff|webp)(\?.*)?$/i }),
      localApi(),
    ],
    test: {
      environment: 'node',
    },
  };
});
