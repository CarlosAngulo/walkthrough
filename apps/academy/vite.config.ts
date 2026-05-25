/// <reference types="vitest" />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Resolve directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import semantic analyzer and rules engine directly using workspace packages
import { analyzeFile } from '../../packages/semantic-analyzer/src/index.js';
import { evaluateRules } from '../../packages/rules-engine/src/index.js';

const LEVEL1_RULES = [
  'L1_WRITABLE_SIGNAL',
  'L1_SIGNAL_INPUT',
  'L1_COMPUTED_SIGNAL',
  'L1_NO_MANUAL_RECALCULATION'
];

function runAnalysis() {
  const filePath = path.resolve(__dirname, 'src/app/levels/level1-counter/counter.component.ts');
  if (!fs.existsSync(filePath)) {
    throw new Error(`[Learning Engine] File not found: ${filePath}`);
  }
  const analysis = analyzeFile(filePath);
  return evaluateRules(analysis, LEVEL1_RULES);
}

function learningEnginePlugin() {
  return {
    name: 'vite-plugin-learning-engine',
    configureServer(server: any) {
      // 1. Globally mounted middleware for HTTP API
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = req.url || '';
        if (url === '/api/learning-engine/status' || url.startsWith('/api/learning-engine/status?')) {
          try {
            const evaluation = runAnalysis();
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            });
            res.end(JSON.stringify(evaluation));
          } catch (e: any) {
            console.error('[Learning Engine Plugin] HTTP API error:', e);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message || 'Error running AST rules check', stack: e.stack }));
          }
          return;
        }
        next();
      });

      // 2. WebSocket ping handler
      server.ws.on('learning-engine:ping', () => {
        try {
          const evaluation = runAnalysis();
          server.ws.send('learning-engine:status', evaluation);
        } catch (e: any) {
          console.error('[Learning Engine Plugin] WS ping error:', e);
        }
      });

      // 3. On server start, proactively send initial status after a short delay
      //    This ensures clients that connect after a page refresh get data via WS too
      setTimeout(() => {
        try {
          const evaluation = runAnalysis();
          server.ws.send('learning-engine:status', evaluation);
          console.log('[Learning Engine Plugin] Initial WS status broadcast sent.');
        } catch (e: any) {
          console.error('[Learning Engine Plugin] Initial broadcast error:', e);
        }
      }, 2000);
    },
    handleHotUpdate({ file, server }: any) {
      if (file.endsWith('counter.component.ts')) {
        try {
          const analysis = analyzeFile(file);
          const evaluation = evaluateRules(analysis, LEVEL1_RULES);
          server.ws.send('learning-engine:status', evaluation);
        } catch (e: any) {
          console.error('[Learning Engine Plugin] HMR error:', e);
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
