/** @type {import('vite').UserConfig} */
export default {
  base: "./",
  worker: {
    format: "es",
  },
  server: {
    port: 3000,
    strictPort: true,
    open: "index.html",
    middlewareMode: false,
    https: {
      key: "../../js/localhost.key",
      cert: "../../js/localhost-fullchain.pem",
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "esnext",
    sourcemap: true,
  },
};
