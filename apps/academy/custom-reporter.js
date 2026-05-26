const fs = require('fs');
const path = require('path');

class CustomReporter {
  async onFinished(files) {
    // Recursively extract all test tasks
    const extractTasks = (tasks) => {
      const list = [];
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
      const ports = [5173, 5174, 5175, 5176];
      await Promise.all(ports.map(async (port) => {
        try {
          const res = await fetch(`http://localhost:${port}/api/learning-engine/test-results`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(results)
          });
          if (res.ok) {
            console.log(`[Custom Reporter] Successfully streamed test results to Vite port ${port}`);
          }
        } catch (e) {
          // Ignore connection errors for inactive ports
        }
      }));
    } catch (e) {
      console.warn('[Custom Reporter] Failed to send test results to dev server:', e.message);
    }
  }
}

module.exports = CustomReporter;
