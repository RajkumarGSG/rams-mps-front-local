import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue2";
import path from 'path';

export default defineConfig({
  plugins: [vue()],

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: './tests/setup.js', // Separate file for tests configuration
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**tests/store/planning.*',
      '**tests/routes.*',
    ]
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  cache: { // Включаем кэширование для ускорения
    build: {
      cacheDir: '.vite-cache',
    },
  },
});