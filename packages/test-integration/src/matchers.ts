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
          message: () => `Regla "${ruleId}" no encontrada en el catálogo.`
        };
      }

      const pass = evaluation.success;
      const message = pass
        ? () => `🟢 Éxito: El archivo satisface la regla pedagógica "${ruleId}".`
        : () => `❌ Error de aprendizaje en la regla "${ruleId}":\n\n` +
                `Detalle: ${evaluation.message}\n` +
                (evaluation.hint ? `Pista: ${evaluation.hint}\n` : '');

      return {
        pass,
        message
      };
    } catch (err: any) {
      return {
        pass: false,
        message: () => `Error al analizar el archivo "${filePath}": ${err.message}`
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
        ? () => `🟢 Éxito: El archivo satisface todas las reglas del nivel.`
        : () => `❌ Errores de aprendizaje detectados en el archivo:\n\n` +
                failed.map((ev, i) => 
                  `${i + 1}. [${ev.ruleId}]: ${ev.message}\n` +
                  (ev.hint ? `   Pista: ${ev.hint}\n` : '')
                ).join('\n');

      return {
        pass,
        message
      };
    } catch (err: any) {
      return {
        pass: false,
        message: () => `Error al analizar el archivo "${filePath}": ${err.message}`
      };
    }
  }
});
