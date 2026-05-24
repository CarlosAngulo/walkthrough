/// <reference types="vitest" />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import semantic analyzer and rules engine directly using workspace packages
import { analyzeFile } from '../../packages/semantic-analyzer/src/index.js';
import { evaluateRules } from '../../packages/rules-engine/src/index.js';

function learningEnginePlugin() {
  return {
    name: 'vite-plugin-learning-engine',
    configureServer(server) {
      server.ws.on('learning-engine:ping', () => {
        try {
          const filePath = path.resolve(__dirname, 'src/app/levels/level1-counter/counter.component.ts');
          const analysis = analyzeFile(filePath);
          const evaluation = evaluateRules(analysis, [
            'L1_WRITABLE_SIGNAL',
            'L1_SIGNAL_INPUT',
            'L1_COMPUTED_SIGNAL',
            'L1_NO_MANUAL_RECALCULATION'
          ]);
          server.ws.send('learning-engine:status', evaluation);
        } catch (e) {
          // Silent catch
        }
      });
    },
    handleHotUpdate({ file, server }) {
      if (file.endsWith('counter.component.ts')) {
        try {
          const analysis = analyzeFile(file);
          const evaluation = evaluateRules(analysis, [
            'L1_WRITABLE_SIGNAL',
            'L1_SIGNAL_INPUT',
            'L1_COMPUTED_SIGNAL',
            'L1_NO_MANUAL_RECALCULATION'
          ]);
          server.ws.send('learning-engine:status', evaluation);
        } catch (e) {
          // Silent catch
        }
      }
    }
  };
}

export default defineConfig(({ mode }) => {
  const isTest = mode === 'test' || !!process.env['VITEST'];
  return {
    plugins: [
      angular({
        tsconfig: isTest
          ? path.resolve(__dirname, 'tsconfig.json')
          : path.resolve(__dirname, 'tsconfig.app.json'),
      }),
      !isTest && learningEnginePlugin(),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@learning-engine/semantic-analyzer': path.resolve(__dirname, '../../packages/semantic-analyzer/src/index.ts'),
        '@learning-engine/rules-engine': path.resolve(__dirname, '../../packages/rules-engine/src/index.ts'),
        '@learning-engine/learning-state': path.resolve(__dirname, '../../packages/learning-state/src/index.ts'),
        '@learning-engine/overlay-system': path.resolve(__dirname, '../../packages/overlay-system/src/index.ts'),
        '@learning-engine/test-integration': path.resolve(__dirname, '../../packages/test-integration/src/index.ts'),
        '@learning-engine/angular-signals-adapter': path.resolve(__dirname, '../../adapters/angular-signals/src/index.ts')
      }
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: [path.resolve(__dirname, 'src/test-setup.ts')],
      include: ['src/**/*.spec.ts'],
      onStackTrace(error) {
        return false;
      },
    },
  };
});
