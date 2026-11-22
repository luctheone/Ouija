import { defineConfig } from 'tsup';

const env = {
  'process.env.OUIJA_BACKEND_URL': JSON.stringify(process.env.OUIJA_BACKEND_URL || 'https://ouijaboard.vercel.app'),
  'process.env.NODE_ENV': JSON.stringify('production'),
};

export default defineConfig([
  {
    entry: ['src/background.ts'],
    format: ['esm'],
    outDir: 'dist',
    outExtension: () => ({ js: '.js' }),
    define: env,
  },
  {
    entry: ['src/content.ts', 'src/popup.ts'],
    format: ['iife'],
    outDir: 'dist',
    outExtension: () => ({ js: '.js' }),
    define: env,
  },
  {
    entry: ['src/sidebar/main.tsx'],
    format: ['iife'],
    outDir: 'dist',
    outExtension: () => ({ js: '.js' }),
    define: env,
    minify: true,
    esbuildOptions(options) {
      options.entryNames = 'sidebar';
    },
    loader: {
      '.css': 'css',
    },
  },
  {
    entry: ['src/graph-panel/main.tsx'],
    format: ['iife'],
    outDir: 'dist',
    outExtension: () => ({ js: '.js' }),
    define: env,
    minify: true,
    esbuildOptions(options) {
      options.entryNames = 'graph-panel';
    },
    loader: {
      '.css': 'css',
    },
  },
]);
