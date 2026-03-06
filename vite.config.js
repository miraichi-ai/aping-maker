import { defineConfig } from 'vite';

export default defineConfig({
  base: '/aping-maker/',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
  server: {
    open: true,
  },
});
