import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.VITE_BASE_URL || './',
  server: {
    host: true,
    port: 5173
  }
});
