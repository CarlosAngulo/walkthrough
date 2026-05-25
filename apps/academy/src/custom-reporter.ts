import { Reporter, File } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

export default class CustomReporter implements Reporter {
  async onFinished(files: File[]) {
    // Recursively extract all test tasks
    const extractTasks = (tasks: any[]): any[] => {
      const list: any[] = [];
      tasks.forEach(t => {
        if (t.type === 'test') {
          list.push({
            name: t.name,
            status: t.result?.state || 'pending', // 'pass' | 'fail' | 'pending'
            error: t.result?.errors?.[0]?.message || null
          });
        } else if (t.type === 'suite' && t.tasks) {
          list.push(...extractTasks(t.tasks));
        }
      });
      return list;
    };

    const results = files.map(file => {
      const normalizedPath = file.filepath.replace(/\\/g, '/');
      return {
        filepath: normalizedPath,
        name: path.basename(file.filepath),
        tasks: extractTasks(file.tasks || [])
      };
    });

    // Send the results to the running Vite dev server
    try {
      const portFile = path.resolve(process.cwd(), 'apps/academy/.vite-port');
      if (fs.existsSync(portFile)) {
        const port = fs.readFileSync(portFile, 'utf8').trim();
        await fetch(`http://localhost:${port}/api/learning-engine/test-results`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(results)
        });
        console.log(`[Custom Reporter] Streamed test results to Vite port ${port}`);
      }
    } catch (e: any) {
      console.warn('[Custom Reporter] Failed to send test results to dev server:', e.message);
    }
  }
}
