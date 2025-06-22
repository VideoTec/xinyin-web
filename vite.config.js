/** @type {import('vite').UserConfig} */
export default {
  server: {
    port: 3000,
    strictPort: true,
    open: "demo.html",
    middlewareMode: false,
    https: {
      key: "../../js/localhost.key",
      cert: "../../js/localhost-fullchain.pem",
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
};
