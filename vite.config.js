import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/** @type {import('vite').UserConfig} */
export default {
  base: './',
  worker: {
    format: 'es',
  },
  server: {
    port: 3000,
    strictPort: true,
    open: true,
    middlewareMode: false,
    https: {
      key: '../../js/localhost.key',
      cert: '../../js/localhost-fullchain.pem',
    },
  },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    target: 'esnext',
    sourcemap: true,
    minify: true,
  },
  plugins: [
    react(),
    VitePWA({
      mode: 'production',
      registerType: 'prompt',
      minify: true,
      manifest: {
        name: '心印数字钱包',
        short_name: '心印钱包',
        description: '心印数字钱包 - 数字资产查看工具',
        theme_color: '#42b5f4',
        icons: [
          {
            src: 'wallet.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
        start_url: './',
        display: 'standalone',
        background_color: '#f0fbff',
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: null,
      },
    }),
  ],
};
