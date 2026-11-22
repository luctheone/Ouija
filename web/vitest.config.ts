import { defineConfig } from 'vitest/config';

// Manual `@/` → ./src alias (vite-tsconfig-paths is not installed).
export default defineConfig({
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
