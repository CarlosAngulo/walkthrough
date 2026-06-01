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

    // Check template interpolation syntax
    const usesOldCounterTemplate = /{{\s*counter\s*}}/.test(analysis.templateContent || '');
    if (usesOldCounterTemplate) {
      return {
        ruleId: 'L1_WRITABLE_SIGNAL',
        success: false,
        anchor: 'counter-value',
        message: '¡Excelente en TypeScript! Pero te falta actualizar el llamado en el template HTML.',
        hint: 'Abre "counter.component.html" y cambia la interpolación de "{{ counter }}" a "{{ counter() }}" para poder invocar la señal.'
      };
    }

    return {
      ruleId: 'L1_WRITABLE_SIGNAL',
      success: true,
      anchor: 'counter-value',
      message: '¡Excelente! "counter" está declarado e invocado correctamente como un Writable Signal.'
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

    // Check template input syntax
    const usesOldStepTemplate = /{{\s*step\s*}}/.test(analysis.templateContent || '');
    if (usesOldStepTemplate) {
      return {
        ruleId: 'L1_SIGNAL_INPUT',
        success: false,
        anchor: 'step-input',
        message: '¡Clase de TypeScript correcta! Pero te falta actualizar la interpolación de "step" en tu template.',
        hint: 'Abre "counter.component.html" y cambia "{{ step }}" por "{{ step() }}" en el texto informativo y dentro de los botones de incremento/decremento.'
      };
    }

    return {
      ruleId: 'L1_SIGNAL_INPUT',
      success: true,
      anchor: 'step-input',
      message: '¡Genial! "step" es ahora un Signal Input reactivo e invocado correctamente.'
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

    // Check template computed syntax
    const usesOldDoubleTemplate = /{{\s*doubleCounter\s*}}/.test(analysis.templateContent || '');
    if (usesOldDoubleTemplate) {
      return {
        ruleId: 'L1_COMPUTED_SIGNAL',
        success: false,
        anchor: 'double-value',
        message: '¡Computed Signal correcto en TS! Pero te falta invocarlo en el HTML.',
        hint: 'Abre "counter.component.html" y cambia "{{ doubleCounter }}" por "{{ doubleCounter() }}".'
      };
    }

    return {
      ruleId: 'L1_COMPUTED_SIGNAL',
      success: true,
      anchor: 'double-value',
      message: '¡Fantástico! "doubleCounter" es un Computed Signal que deriva su estado reactivamente e invocado en el HTML.'
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

// Rules catalog for Level 2 Tasks & Computed Chains
export const L2_RULES: Record<string, PedagogicalRule> = {
  L2_TASKS_SIGNAL: (analysis) => {
    const tasksProp = analysis.properties.find(p => p.name === 'tasks');
    if (!tasksProp) {
      return {
        ruleId: 'L2_TASKS_SIGNAL',
        success: false,
        anchor: 'task-list',
        message: 'No se detectó la propiedad "tasks" en tu componente.',
        hint: 'Asegúrate de no eliminar la propiedad "tasks" al refactorizar.'
      };
    }
    if (tasksProp.type !== 'signal') {
      return {
        ruleId: 'L2_TASKS_SIGNAL',
        success: false,
        anchor: 'task-list',
        message: 'La propiedad "tasks" debe ser declarada como una Writable Signal.',
        hint: 'Usa: tasks = signal<Task[]>([...]);'
      };
    }
    return {
      ruleId: 'L2_TASKS_SIGNAL',
      success: true,
      anchor: 'task-list',
      message: '¡Excelente! "tasks" es un Writable Signal reactivo.'
    };
  },

  L2_FILTER_SIGNAL: (analysis) => {
    const filterProp = analysis.properties.find(p => p.name === 'filter');
    if (!filterProp) {
      return {
        ruleId: 'L2_FILTER_SIGNAL',
        success: false,
        anchor: 'filters-bar',
        message: 'No se detectó la propiedad "filter" en tu componente.',
        hint: 'Declara "filter" para controlar el estado del filtro de tareas.'
      };
    }
    if (filterProp.type !== 'signal') {
      return {
        ruleId: 'L2_FILTER_SIGNAL',
        success: false,
        anchor: 'filters-bar',
        message: 'La propiedad "filter" debe ser declarada como una Writable Signal.',
        hint: 'Usa: filter = signal<\'all\' | \'pending\' | \'completed\'>(\'all\');'
      };
    }

    // Check template filter binding syntax: filter === 'all' or similar without function call
    const usesOldFilterTemplate = /filter\s*===\s*['"`]/.test(analysis.templateContent || '');
    if (usesOldFilterTemplate) {
      return {
        ruleId: 'L2_FILTER_SIGNAL',
        success: false,
        anchor: 'filters-bar',
        message: '¡TS correcto! Pero te falta actualizar los llamados a "filter" en tu archivo HTML.',
        hint: 'Abre "task-filter.component.html" y cambia "filter === \'all\'" por "filter() === \'all\'" en todas las directivas de estilo active.'
      };
    }

    return {
      ruleId: 'L2_FILTER_SIGNAL',
      success: true,
      anchor: 'filters-bar',
      message: '¡Excelente! El filtro activo está declarado e implementado en el template como una señal.'
    };
  },

  L2_FILTERED_TASKS_COMPUTED: (analysis) => {
    const filteredProp = analysis.properties.find(p => p.name === 'filteredTasks');
    if (!filteredProp) {
      return {
        ruleId: 'L2_FILTERED_TASKS_COMPUTED',
        success: false,
        anchor: 'task-list',
        message: 'No se detectó la propiedad "filteredTasks" en tu componente.',
        hint: 'Define "filteredTasks" para reactivamente mapear la lista de tareas filtradas.'
      };
    }
    if (filteredProp.type !== 'computed') {
      return {
        ruleId: 'L2_FILTERED_TASKS_COMPUTED',
        success: false,
        anchor: 'task-list',
        message: 'La propiedad "filteredTasks" debe ser un Computed Signal.',
        hint: 'Usa: filteredTasks = computed(() => { ... });'
      };
    }

    // Check HTML iteration syntax: task of filteredTasks (without call)
    const usesOldFilteredTasksTemplate = /of\s+filteredTasks\b(?!(\s*\(\)))/.test(analysis.templateContent || '');
    if (usesOldFilteredTasksTemplate) {
      return {
        ruleId: 'L2_FILTERED_TASKS_COMPUTED',
        success: false,
        anchor: 'task-list',
        message: '¡Computed Signal correcto en TS! Pero te falta invocarlo en el bucle @for de tu HTML.',
        hint: 'Abre "task-filter.component.html" y actualiza la iteración a: "@for (task of filteredTasks(); track task.title)".'
      };
    }

    return {
      ruleId: 'L2_FILTERED_TASKS_COMPUTED',
      success: true,
      anchor: 'task-list',
      message: '¡Perfecto! filteredTasks deriva reactivamente el estado y se itera correctamente como una función en el template.'
    };
  },

  L2_PENDING_COUNT_COMPUTED: (analysis) => {
    const countProp = analysis.properties.find(p => p.name === 'pendingCount');
    if (!countProp) {
      return {
        ruleId: 'L2_PENDING_COUNT_COMPUTED',
        success: false,
        anchor: 'filters-bar',
        message: 'No se detectó la propiedad "pendingCount" en tu componente.',
        hint: 'Declara la Computed Signal "pendingCount" para derivar la cantidad de tareas pendientes.'
      };
    }
    if (countProp.type !== 'computed') {
      return {
        ruleId: 'L2_PENDING_COUNT_COMPUTED',
        success: false,
        anchor: 'filters-bar',
        message: 'La propiedad "pendingCount" debe ser un Computed Signal.',
        hint: 'Usa: pendingCount = computed(() => ...);'
      };
    }

    // Check HTML binding syntax: {{ pendingCount }}
    const usesOldPendingCountTemplate = /{{\s*pendingCount\s*}}/.test(analysis.templateContent || '');
    if (usesOldPendingCountTemplate) {
      return {
        ruleId: 'L2_PENDING_COUNT_COMPUTED',
        success: false,
        anchor: 'filters-bar',
        message: '¡TypeScript listo! Pero te falta actualizar la interpolación de "pendingCount" en el HTML.',
        hint: 'Abre "task-filter.component.html" y cambia "{{ pendingCount }}" por "{{ pendingCount() }}" en la etiqueta de pendientes.'
      };
    }

    return {
      ruleId: 'L2_PENDING_COUNT_COMPUTED',
      success: true,
      anchor: 'filters-bar',
      message: '¡Genial! pendingCount está derivado de forma reactiva e impreso correctamente en el HTML.'
    };
  },

  L2_COMPLETED_COUNT_COMPUTED: (analysis) => {
    const countProp = analysis.properties.find(p => p.name === 'completedCount');
    if (!countProp) {
      return {
        ruleId: 'L2_COMPLETED_COUNT_COMPUTED',
        success: false,
        anchor: 'filters-bar',
        message: 'No se detectó la propiedad "completedCount" en tu componente.',
        hint: 'Declara la Computed Signal "completedCount" para derivar la cantidad de tareas completadas.'
      };
    }
    if (countProp.type !== 'computed') {
      return {
        ruleId: 'L2_COMPLETED_COUNT_COMPUTED',
        success: false,
        anchor: 'filters-bar',
        message: 'La propiedad "completedCount" debe ser un Computed Signal.',
        hint: 'Usa: completedCount = computed(() => ...);'
      };
    }

    // Check HTML binding syntax: {{ completedCount }}
    const usesOldCompletedCountTemplate = /{{\s*completedCount\s*}}/.test(analysis.templateContent || '');
    if (usesOldCompletedCountTemplate) {
      return {
        ruleId: 'L2_COMPLETED_COUNT_COMPUTED',
        success: false,
        anchor: 'filters-bar',
        message: '¡TypeScript listo! Pero te falta actualizar la interpolación de "completedCount" en el HTML.',
        hint: 'Abre "task-filter.component.html" y cambia "{{ completedCount }}" por "{{ completedCount() }}" en la etiqueta de completados.'
      };
    }

    return {
      ruleId: 'L2_COMPLETED_COUNT_COMPUTED',
      success: true,
      anchor: 'filters-bar',
      message: '¡Genial! completedCount está derivado de forma reactiva e impreso correctamente en el HTML.'
    };
  }
};

// Rules catalog for Level 3 Theme Sync & Side Effects
export const L3_RULES: Record<string, PedagogicalRule> = {
  L3_THEME_SIGNAL: (analysis) => {
    const themeProp = analysis.properties.find(p => p.name === 'theme');
    if (!themeProp) {
      return {
        ruleId: 'L3_THEME_SIGNAL',
        success: false,
        anchor: 'preferences-controls',
        message: 'No se detectó la propiedad "theme" en tu componente.',
        hint: 'Asegúrate de conservar la propiedad "theme" durante la refactorización.'
      };
    }
    if (themeProp.type !== 'signal') {
      return {
        ruleId: 'L3_THEME_SIGNAL',
        success: false,
        anchor: 'preferences-controls',
        message: 'La propiedad "theme" debe ser declarada como una Writable Signal.',
        hint: 'Usa: theme = signal<\'dark\' | \'light\'>(\'dark\');'
      };
    }

    // Check template binding: theme === 'dark' or 'light'
    const usesOldThemeTemplate = /theme\s*===\s*['"`]/.test(analysis.templateContent || '');
    if (usesOldThemeTemplate) {
      return {
        ruleId: 'L3_THEME_SIGNAL',
        success: false,
        anchor: 'preferences-controls',
        message: '¡TS correcto! Pero debes actualizar los llamados del tema en el archivo HTML.',
        hint: 'Abre "theme-panel.component.html" y actualiza "theme === \'dark\'" por "theme() === \'dark\'" y "theme === \'light\'" por "theme() === \'light\'".'
      };
    }

    return {
      ruleId: 'L3_THEME_SIGNAL',
      success: true,
      anchor: 'preferences-controls',
      message: '¡Genial! theme es una señal e invocado correctamente en el template.'
    };
  },

  L3_FONT_SIZE_SIGNAL: (analysis) => {
    const fontProp = analysis.properties.find(p => p.name === 'fontSize');
    if (!fontProp) {
      return {
        ruleId: 'L3_FONT_SIZE_SIGNAL',
        success: false,
        anchor: 'preferences-controls',
        message: 'No se detectó la propiedad "fontSize" en tu componente.',
        hint: 'Conserva "fontSize" para poder dimensionar la fuente de vista previa.'
      };
    }
    if (fontProp.type !== 'signal') {
      return {
        ruleId: 'L3_FONT_SIZE_SIGNAL',
        success: false,
        anchor: 'preferences-controls',
        message: 'La propiedad "fontSize" debe ser declarada como una Writable Signal.',
        hint: 'Usa: fontSize = signal<number>(16);'
      };
    }

    // Check template binding: disabled="fontSize <= 14" or similar (without call)
    const usesOldFontSizeTemplate = /fontSize\s*(<=|>=|\+|-)\s*/.test(analysis.templateContent || '') || /{{\s*fontSize\s*}}/.test(analysis.templateContent || '');
    if (usesOldFontSizeTemplate) {
      return {
        ruleId: 'L3_FONT_SIZE_SIGNAL',
        success: false,
        anchor: 'preferences-controls',
        message: '¡TS correcto! Pero te falta invocar la señal de tamaño de fuente en el HTML.',
        hint: 'Abre "theme-panel.component.html" y actualiza todas las expresiones de "fontSize" por "fontSize()" (en las condiciones [disabled] y en la visualización {{ fontSize }}px).'
      };
    }

    return {
      ruleId: 'L3_FONT_SIZE_SIGNAL',
      success: true,
      anchor: 'preferences-controls',
      message: '¡Estupendo! fontSize es una Writable Signal y su llamado en el HTML es el correcto.'
    };
  },

  L3_ACCENT_COLOR_SIGNAL: (analysis) => {
    const accentProp = analysis.properties.find(p => p.name === 'accentColor');
    if (!accentProp) {
      return {
        ruleId: 'L3_ACCENT_COLOR_SIGNAL',
        success: false,
        anchor: 'preferences-controls',
        message: 'No se detectó la propiedad "accentColor" en tu componente.',
        hint: 'Conserva "accentColor" para matizar la visualización de accent principal.'
      };
    }
    if (accentProp.type !== 'signal') {
      return {
        ruleId: 'L3_ACCENT_COLOR_SIGNAL',
        success: false,
        anchor: 'preferences-controls',
        message: 'La propiedad "accentColor" debe ser declarada como una Writable Signal.',
        hint: 'Usa: accentColor = signal<\'purple\' | \'cyan\' | \'pink\'>(\'purple\');'
      };
    }

    // Check template binding: accentColor === 'purple' etc. without call
    const usesOldAccentTemplate = /accentColor\s*===\s*['"`]/.test(analysis.templateContent || '');
    if (usesOldAccentTemplate) {
      return {
        ruleId: 'L3_ACCENT_COLOR_SIGNAL',
        success: false,
        anchor: 'preferences-controls',
        message: '¡TypeScript correcto! Pero te falta invocar "accentColor" en el template HTML.',
        hint: 'Abre "theme-panel.component.html" y cambia "accentColor === \'purple\'" por "accentColor() === \'purple\'" (y repite para \'cyan\' y \'pink\' en los círculos de la paleta).'
      };
    }

    return {
      ruleId: 'L3_ACCENT_COLOR_SIGNAL',
      success: true,
      anchor: 'preferences-controls',
      message: '¡Genial! El color de acento reactivo está enlazado e invocado correctamente en el template HTML.'
    };
  }
};

// Rules catalog for Level 4 Reactive Architecture
export const L4_RULES: Record<string, PedagogicalRule> = {
  L4_SERVICE_PRIVATE_ITEMS: (analysis) => {
    const privateProp = analysis.properties.find(p => p.name === '_items');
    if (!privateProp) {
      return {
        ruleId: 'L4_SERVICE_PRIVATE_ITEMS',
        success: false,
        anchor: 'cart-summary',
        message: 'No se detectó la propiedad privada "_items" en tu clase CartService.',
        hint: 'Declara la señal mutable como privada usando: private _items = signal<CartItem[]>([]);'
      };
    }
    if (privateProp.type !== 'signal') {
      return {
        ruleId: 'L4_SERVICE_PRIVATE_ITEMS',
        success: false,
        anchor: 'cart-summary',
        message: 'La propiedad privada "_items" debe ser una Writable Signal.',
        hint: 'Usa la función signal(): private _items = signal<CartItem[]>([]);'
      };
    }
    return {
      ruleId: 'L4_SERVICE_PRIVATE_ITEMS',
      success: true,
      anchor: 'cart-summary',
      message: '¡Excelente! "_items" es una señal writable privada inmaculada.'
    };
  },

  L4_SERVICE_READONLY_ITEMS: (analysis) => {
    const publicProp = analysis.properties.find(p => p.name === 'items');
    if (!publicProp) {
      return {
        ruleId: 'L4_SERVICE_READONLY_ITEMS',
        success: false,
        anchor: 'cart-summary',
        message: 'No se detectó la propiedad pública "items" en tu clase CartService.',
        hint: 'Asegúrate de exponer la propiedad pública "items" para los componentes.'
      };
    }
    const isReadonlyInit = publicProp.initializerText?.includes('asReadonly') || false;
    if (!isReadonlyInit) {
      return {
        ruleId: 'L4_SERVICE_READONLY_ITEMS',
        success: false,
        anchor: 'cart-summary',
        message: 'La propiedad pública "items" debe ser expuesta como una señal de solo lectura.',
        hint: 'Asigna la propiedad pública de esta manera para evitar mutaciones directas: items = this._items.asReadonly();'
      };
    }
    return {
      ruleId: 'L4_SERVICE_READONLY_ITEMS',
      success: true,
      anchor: 'cart-summary',
      message: '¡Perfecto! El estado expuesto "items" está protegido con asReadonly() para garantizar la inmutabilidad.'
    };
  },

  L4_PRODUCT_LIST_OUTPUT: (analysis) => {
    const outputProp = analysis.properties.find(p => p.name === 'productAdded');
    if (!outputProp) {
      return {
        ruleId: 'L4_PRODUCT_LIST_OUTPUT',
        success: false,
        anchor: 'cart-summary',
        message: 'No se detectó la propiedad "productAdded" en tu componente ProductListComponent.',
        hint: 'Conserva el emisor de agregaciones "productAdded" para notificar clicks.'
      };
    }
    const usesOutputAPI = outputProp.initializerText?.includes('output(') || outputProp.initializerText?.includes('output<') || false;
    if (!usesOutputAPI) {
      return {
        ruleId: 'L4_PRODUCT_LIST_OUTPUT',
        success: false,
        anchor: 'cart-summary',
        message: 'La propiedad "productAdded" debe declararse utilizando el nuevo API de eventos output().',
        hint: 'Reemplaza "@Output() productAdded = new EventEmitter..." por "productAdded = output<Product>();" importando "output" desde "@angular/core".'
      };
    }
    return {
      ruleId: 'L4_PRODUCT_LIST_OUTPUT',
      success: true,
      anchor: 'cart-summary',
      message: '¡Increíble! Utilizas el API de eventos moderno output() basado en señales.'
    };
  },

  L4_PRODUCT_LIST_INJECTION: (analysis) => {
    const diProp = analysis.properties.find(p => p.name === 'cartService');
    if (!diProp) {
      return {
        ruleId: 'L4_PRODUCT_LIST_INJECTION',
        success: false,
        anchor: 'cart-summary',
        message: 'No se detectó el servicio "cartService" inyectado en ProductListComponent.',
        hint: 'Inyecta la propiedad pública o protegida cartService en tu componente.'
      };
    }
    const usesInject = diProp.initializerText?.includes('inject(') || false;
    if (!usesInject) {
      return {
        ruleId: 'L4_PRODUCT_LIST_INJECTION',
        success: false,
        anchor: 'cart-summary',
        message: 'Debes inyectar el "cartService" de forma declarativa usando el API inject().',
        hint: 'Reemplaza la inyección tradicional del constructor por: cartService = inject(CartService); y remueve el constructor.'
      };
    }
    return {
      ruleId: 'L4_PRODUCT_LIST_INJECTION',
      success: true,
      anchor: 'cart-summary',
      message: '¡Excelente! Utilizas la inyección de dependencias funcional con inject() de forma elegante.'
    };
  }
};

// Rules catalog for Level 5 RxJS Interop
export const L5_RULES: Record<string, PedagogicalRule> = {
  L5_SEARCH_QUERY_SIGNAL: (analysis) => {
    const searchProp = analysis.properties.find(p => p.name === 'searchQuery');
    if (!searchProp) {
      return {
        ruleId: 'L5_SEARCH_QUERY_SIGNAL',
        success: false,
        anchor: 'search-input',
        message: 'No se detectó la propiedad "searchQuery" en tu componente.',
        hint: 'Asegúrate de declarar la propiedad searchQuery para enlazar el texto de búsqueda.'
      };
    }
    if (searchProp.type !== 'signal') {
      return {
        ruleId: 'L5_SEARCH_QUERY_SIGNAL',
        success: false,
        anchor: 'search-input',
        message: 'La propiedad "searchQuery" debe ser declarada como una Writable Signal.',
        hint: 'Usa: searchQuery = signal<string>(\'\'); importando signal desde @angular/core.'
      };
    }
    return {
      ruleId: 'L5_SEARCH_QUERY_SIGNAL',
      success: true,
      anchor: 'search-input',
      message: '¡Excelente! "searchQuery" es una Writable Signal reactiva.'
    };
  },

  L5_TO_OBSERVABLE: (analysis) => {
    const toObsRegex = /toObservable\s*\(\s*(this\.)?searchQuery\s*\)/;
    const usesToObservable = toObsRegex.test(analysis.fileContent || '');
    if (!usesToObservable) {
      return {
        ruleId: 'L5_TO_OBSERVABLE',
        success: false,
        anchor: 'search-input',
        message: 'No se detectó la conversión de "searchQuery" a Observable usando toObservable().',
        hint: 'Usa la función toObservable(this.searchQuery) de @angular/core/rxjs-interop para crear un flujo Observable.'
      };
    }
    return {
      ruleId: 'L5_TO_OBSERVABLE',
      success: true,
      anchor: 'search-input',
      message: '¡Perfecto! Has convertido exitosamente la Writable Signal "searchQuery" a Observable con toObservable().'
    };
  },

  L5_RXJS_OPERATORS: (analysis) => {
    const fileContent = analysis.fileContent || '';
    const hasDebounce = /debounceTime\s*\(\s*\d+\s*\)/.test(fileContent);
    const hasDistinct = /distinctUntilChanged\s*\(\s*\)/.test(fileContent);
    const hasSwitchMap = /switchMap\s*\(/.test(fileContent);

    if (!hasDebounce) {
      return {
        ruleId: 'L5_RXJS_OPERATORS',
        success: false,
        anchor: 'search-input',
        message: 'Falta aplicar el operador de retardo "debounceTime" en el flujo de búsqueda.',
        hint: 'Aplica .pipe(debounceTime(300), ...) para retrasar la búsqueda mientras el usuario escribe y no saturar el servidor.'
      };
    }
    if (!hasDistinct) {
      return {
        ruleId: 'L5_RXJS_OPERATORS',
        success: false,
        anchor: 'search-input',
        message: 'Falta aplicar el operador "distinctUntilChanged" en el flujo de búsqueda.',
        hint: 'Añade distinctUntilChanged() a la tubería para evitar búsquedas si el texto no ha cambiado realmente.'
      };
    }
    if (!hasSwitchMap) {
      return {
        ruleId: 'L5_RXJS_OPERATORS',
        success: false,
        anchor: 'search-input',
        message: 'Falta aplicar el operador de aplanamiento asíncrono "switchMap" en el flujo de búsqueda.',
        hint: 'Usa switchMap(query => this.searchService.search(query)) para cancelar búsquedas anteriores en vuelo si se inicia una nueva.'
      };
    }

    return {
      ruleId: 'L5_RXJS_OPERATORS',
      success: true,
      anchor: 'search-input',
      message: '¡Espectacular! Implementas las mejores prácticas de optimización de flujos asíncronos con debounceTime, distinctUntilChanged y switchMap.'
    };
  },

  L5_TO_SIGNAL: (analysis) => {
    const resultsProp = analysis.properties.find(p => p.name === 'searchResults');
    if (!resultsProp) {
      return {
        ruleId: 'L5_TO_SIGNAL',
        success: false,
        anchor: 'results-panel',
        message: 'No se detectó la propiedad "searchResults" en tu clase.',
        hint: 'Asegúrate de definir la propiedad "searchResults" para almacenar los resultados del buscador.'
      };
    }
    const usesToSignal = resultsProp.initializerText?.includes('toSignal(') || false;
    if (!usesToSignal) {
      return {
        ruleId: 'L5_TO_SIGNAL',
        success: false,
        anchor: 'results-panel',
        message: 'La propiedad "searchResults" debe ser convertida a Signal usando toSignal().',
        hint: 'Usa la función toSignal(queryObservable) importada de @angular/core/rxjs-interop para transformar el observable final a una señal.'
      };
    }
    const hasInitialValue = resultsProp.initializerText?.includes('initialValue') || false;
    if (!hasInitialValue) {
      return {
        ruleId: 'L5_TO_SIGNAL',
        success: false,
        anchor: 'results-panel',
        message: 'No has especificado un valor inicial seguro "initialValue" al usar toSignal().',
        hint: 'Para evitar que "searchResults()" retorne undefined antes del primer valor emitido, añade la opción: toSignal(..., { initialValue: [] })'
      };
    }
    return {
      ruleId: 'L5_TO_SIGNAL',
      success: true,
      anchor: 'results-panel',
      message: '¡Brillante! Has cerrado la brecha reactiva convirtiendo el flujo de vuelta a una señal de solo lectura "searchResults" y protegiéndola con un initialValue.'
    };
  }
};

export function evaluateRules(analysis: AnalysisResult, ruleIds: string[]): RulesEvaluationResult {
  const evaluations: RuleEvaluation[] = [];
  let isValid = true;

  ruleIds.forEach(id => {
    // Resolve rule from corresponding catalog
    const rule = L1_RULES[id] || L2_RULES[id] || L3_RULES[id] || L4_RULES[id] || L5_RULES[id];
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
