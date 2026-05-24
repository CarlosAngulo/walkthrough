import { AnalysisResult } from '@learning-engine/semantic-analyzer';

export interface RuleEvaluation {
  ruleId: string;
  success: boolean;
  message: string;
  anchor?: string; // Links this feedback to a DOM data-learning-anchor
  hint?: string;
}

export interface RulesEvaluationResult {
  isValid: boolean;
  evaluations: RuleEvaluation[];
}

export type PedagogicalRule = (analysis: AnalysisResult) => RuleEvaluation;

// Built-in rules catalog for Level 1
export const L1_RULES: Record<string, PedagogicalRule> = {
  L1_WRITABLE_SIGNAL: (analysis) => {
    const counterProp = analysis.properties.find(p => p.name === 'counter');
    if (!counterProp) {
      return {
        ruleId: 'L1_WRITABLE_SIGNAL',
        success: false,
        anchor: 'counter-value',
        message: 'No se detectó la propiedad "counter" en tu clase.',
        hint: 'Asegúrate de que no has eliminado o renombrado la propiedad "counter".'
      };
    }
    if (counterProp.type !== 'signal') {
      return {
        ruleId: 'L1_WRITABLE_SIGNAL',
        success: false,
        anchor: 'counter-value',
        message: 'La propiedad "counter" debe ser declarada como una Writable Signal.',
        hint: 'Reemplaza "counter = 0;" por "counter = signal<number>(0);" en tu archivo counter.component.ts.'
      };
    }
    return {
      ruleId: 'L1_WRITABLE_SIGNAL',
      success: true,
      anchor: 'counter-value',
      message: '¡Excelente! "counter" está declarado correctamente como un Writable Signal.'
    };
  },

  L1_SIGNAL_INPUT: (analysis) => {
    const stepProp = analysis.properties.find(p => p.name === 'step');
    if (!stepProp) {
      return {
        ruleId: 'L1_SIGNAL_INPUT',
        success: false,
        anchor: 'step-input',
        message: 'No se detectó la propiedad "step" en tu clase.',
        hint: 'Asegúrate de declarar la propiedad "step" para representar el incremento.'
      };
    }
    if (stepProp.type !== 'input') {
      return {
        ruleId: 'L1_SIGNAL_INPUT',
        success: false,
        anchor: 'step-input',
        message: 'La propiedad "step" debe ser un Signal Input moderno.',
        hint: 'Usa la función "input" de Angular: "step = input<number>(1);". Recuerda importar "input" desde "@angular/core".'
      };
    }
    return {
      ruleId: 'L1_SIGNAL_INPUT',
      success: true,
      anchor: 'step-input',
      message: '¡Genial! "step" es ahora un Signal Input reactivo.'
    };
  },

  L1_COMPUTED_SIGNAL: (analysis) => {
    const doubleProp = analysis.properties.find(p => p.name === 'doubleCounter');
    if (!doubleProp) {
      return {
        ruleId: 'L1_COMPUTED_SIGNAL',
        success: false,
        anchor: 'double-value',
        message: 'No se detectó la propiedad "doubleCounter" en tu clase.',
        hint: 'Declara "doubleCounter" para reactivamente doblar el valor de "counter".'
      };
    }
    if (doubleProp.type !== 'computed') {
      return {
        ruleId: 'L1_COMPUTED_SIGNAL',
        success: false,
        anchor: 'double-value',
        message: 'La propiedad "doubleCounter" debe ser un Computed Signal.',
        hint: 'Usa "doubleCounter = computed(() => this.counter() * 2);" importando "computed" desde "@angular/core".'
      };
    }
    return {
      ruleId: 'L1_COMPUTED_SIGNAL',
      success: true,
      anchor: 'double-value',
      message: '¡Fantástico! "doubleCounter" es un Computed Signal que deriva su estado reactivamente.'
    };
  },

  L1_NO_MANUAL_RECALCULATION: (analysis) => {
    let hasManualRecalc = false;
    let methodNames: string[] = [];

    analysis.methods.forEach(m => {
      if (m.manualAssignments.includes('doubleCounter')) {
        hasManualRecalc = true;
        methodNames.push(m.name);
      }
    });

    if (hasManualRecalc) {
      return {
        ruleId: 'L1_NO_MANUAL_RECALCULATION',
        success: false,
        anchor: 'double-value',
        message: `Anti-patrón detectado: Recálculo manual de "doubleCounter" en el método(s) [${methodNames.join(', ')}].`,
        hint: 'Dado que "doubleCounter" es una señal computada, se actualizará sola automáticamente. Elimina la asignación manual "this.doubleCounter = ..." dentro de tus métodos.'
      };
    }
    return {
      ruleId: 'L1_NO_MANUAL_RECALCULATION',
      success: true,
      anchor: 'double-value',
      message: '¡Excelente! No hay reasignaciones manuales del estado derivado. Sigues las buenas prácticas de arquitectura reactiva.'
    };
  }
};

export function evaluateRules(analysis: AnalysisResult, ruleIds: string[]): RulesEvaluationResult {
  const evaluations: RuleEvaluation[] = [];
  let isValid = true;

  ruleIds.forEach(id => {
    const rule = L1_RULES[id];
    if (rule) {
      const evaluation = rule(analysis);
      evaluations.push(evaluation);
      if (!evaluation.success) {
        isValid = false;
      }
    }
  });

  return {
    isValid,
    evaluations
  };
}
