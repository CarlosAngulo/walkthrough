import { expect } from 'vitest';
import { analyzeFile } from '@learning-engine/semantic-analyzer';
import { evaluateRules } from '@learning-engine/rules-engine';

interface CustomMatchers<R = unknown> {
  toSatisfyRule(ruleId: string): R;
  toSatisfyRules(ruleIds: string[]): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

expect.extend({
  toSatisfyRule(filePath: string, ruleId: string) {
    try {
      const analysis = analyzeFile(filePath);
      const result = evaluateRules(analysis, [ruleId]);
      const evaluation = result.evaluations[0];

      if (!evaluation) {
        return {
          pass: false,
          message: () => `Rule "${ruleId}" not found in the catalog.`
        };
      }

      const pass = evaluation.success;
      const message = pass
        ? () => `🟢 Success: The file satisfies pedagogical rule "${ruleId}".`
        : () => `❌ Learning error in rule "${ruleId}":\n\n` +
                `Detail: ${evaluation.message}\n` +
                (evaluation.hint ? `Hint: ${evaluation.hint}\n` : '');

      return {
        pass,
        message
      };
    } catch (err: any) {
      return {
        pass: false,
        message: () => `Error analyzing file "${filePath}": ${err.message}`
      };
    }
  },

  toSatisfyRules(filePath: string, ruleIds: string[]) {
    try {
      const analysis = analyzeFile(filePath);
      const result = evaluateRules(analysis, ruleIds);

      const failed = result.evaluations.filter(ev => !ev.success);
      const pass = failed.length === 0;

      const message = pass
        ? () => `🟢 Success: The file satisfies all rules for the level.`
        : () => `❌ Learning errors detected in the file:\n\n` +
                failed.map((ev, i) => 
                  `${i + 1}. [${ev.ruleId}]: ${ev.message}\n` +
                  (ev.hint ? `   Hint: ${ev.hint}\n` : '')
                ).join('\n');

      return {
        pass,
        message
      };
    } catch (err: any) {
      return {
        pass: false,
        message: () => `Error analyzing file "${filePath}": ${err.message}`
      };
    }
  }
});
