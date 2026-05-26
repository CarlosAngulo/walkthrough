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

const LEVEL2_RULES = [
  'L2_TASKS_SIGNAL',
  'L2_FILTER_SIGNAL',
  'L2_FILTERED_TASKS_COMPUTED',
  'L2_PENDING_COUNT_COMPUTED',
  'L2_COMPLETED_COUNT_COMPUTED'
];

const LEVEL3_RULES = [
  'L3_THEME_SIGNAL',
  'L3_FONT_SIZE_SIGNAL',
  'L3_ACCENT_COLOR_SIGNAL'
];

function runAnalysis(level: string = 'nivel-1') {
  let filePath = '';
  let rules = [];

  if (level === 'nivel-3') {
    filePath = path.resolve(__dirname, 'src/app/course/level3-effects/theme-panel.component.ts');
    rules = LEVEL3_RULES;
  } else if (level === 'nivel-2') {
    filePath = path.resolve(__dirname, 'src/app/course/level2-state/task-filter.component.ts');
    rules = LEVEL2_RULES;
  } else {
    filePath = path.resolve(__dirname, 'src/app/course/level1-counter/counter.component.ts');
    rules = LEVEL1_RULES;
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`[Learning Engine] File not found: ${filePath}`);
  }
  const analysis = analyzeFile(filePath);
  return evaluateRules(analysis, rules);
}

function learningEnginePlugin() {
  return {
    name: 'vite-plugin-learning-engine',
    configureServer(server: any) {
      let latestTestResults: any[] = [];
      let currentActiveLevel = 'nivel-1';

      // Save Vite dev server port so the Vitest custom reporter knows where to send POSTs
      const writePort = () => {
        if (server.httpServer) {
          const address = server.httpServer.address();
          if (address && typeof address === 'object') {
            const actualPort = address.port;
            const p = path.resolve(__dirname, '.vite-port');
            fs.writeFileSync(p, actualPort.toString());
            console.log(`[Learning Engine Plugin] Wrote actual Vite port ${actualPort} to ${p}`);
            return;
          }
        }
        const port = server.config.server.port || 5173;
        const p = path.resolve(__dirname, '.vite-port');
        fs.writeFileSync(p, port.toString());
        console.log(`[Learning Engine Plugin] Wrote configured Vite port ${port} to ${p}`);
      };

      if (server.httpServer) {
        server.httpServer.once('listening', writePort);
      } else {
        writePort();
      }

      // 1. Globally mounted middleware for HTTP API
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = req.url || '';

        // Handle POST from Vitest custom reporter
        if (req.method === 'POST' && url === '/api/learning-engine/test-results') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', () => {
            try {
              latestTestResults = JSON.parse(body);
              console.log('[Learning Engine Plugin] Received test results. Broadcasting via WS...');
              // Broadcast test results to all browser instances
              server.ws.send('learning-engine:test-results', latestTestResults);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true }));
            } catch (e: any) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: e.message }));
            }
          });
          return;
        }

        // Handle GET request for initial test results load
        if (url === '/api/learning-engine/test-results') {
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          });
          res.end(JSON.stringify(latestTestResults));
          return;
        }

        if (url === '/api/learning-engine/status' || url.startsWith('/api/learning-engine/status?')) {
          try {
            const parsedUrl = new URL(url, 'http://localhost');
            const level = parsedUrl.searchParams.get('level') || currentActiveLevel;
            currentActiveLevel = level;
            const evaluation = runAnalysis(level);
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
      server.ws.on('learning-engine:ping', (data: any) => {
        try {
          const level = data?.level || currentActiveLevel;
          currentActiveLevel = level;
          const evaluation = runAnalysis(level);
          server.ws.send('learning-engine:status', evaluation);
          // Also push latest test results on ping
          server.ws.send('learning-engine:test-results', latestTestResults);
        } catch (e: any) {
          console.error('[Learning Engine Plugin] WS ping error:', e);
        }
      });

      // 3. On server start, proactively send initial status after a short delay
      setTimeout(() => {
        try {
          const evaluation = runAnalysis(currentActiveLevel);
          server.ws.send('learning-engine:status', evaluation);
          server.ws.send('learning-engine:test-results', latestTestResults);
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
      } else if (file.endsWith('task-filter.component.ts')) {
        try {
          const analysis = analyzeFile(file);
          const evaluation = evaluateRules(analysis, LEVEL2_RULES);
          server.ws.send('learning-engine:status', evaluation);
        } catch (e: any) {
          console.error('[Learning Engine Plugin] HMR error:', e);
        }
      } else if (file.endsWith('theme-panel.component.ts')) {
        try {
          const analysis = analyzeFile(file);
          const evaluation = evaluateRules(analysis, LEVEL3_RULES);
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
      reporters: ['basic', './custom-reporter.js'], // Console reporting + custom WS streaming
      setupFiles: [path.resolve(__dirname, 'src/test-setup.ts')],
      include: ['src/**/*.spec.ts'],
      onStackTrace(error) {
        return false;
      },
    },
  };
});
