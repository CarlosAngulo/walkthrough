/// <reference types="vitest" />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import path from 'path';

export default defineConfig(({ mode }) => {
  const isTest = mode === 'test' || !!process.env['VITEST'];
  return {
    plugins: [
      angular({
        tsconfig: isTest
          ? path.resolve(__dirname, 'tsconfig.json')
          : path.resolve(__dirname, 'tsconfig.app.json'),
      }),
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: [path.resolve(__dirname, 'src/test-setup.ts')],
      include: ['src/**/*.spec.ts'],
    },
  };
});
