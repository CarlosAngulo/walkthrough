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
        message: 'The "counter" property was not detected in your class.',
        hint: 'Make sure you have not deleted or renamed the "counter" property.'
      };
    }
    if (counterProp.type !== 'signal') {
      return {
        ruleId: 'L1_WRITABLE_SIGNAL',
        success: false,
        anchor: 'counter-value',
        message: 'The "counter" property must be declared as a Writable Signal.',
        hint: 'Replace "counter = 0;" with "counter = signal<number>(0);" in your counter.component.ts file.'
      };
    }

    // Check template interpolation syntax
    const usesOldCounterTemplate = /{{\s*counter\s*}}/.test(analysis.templateContent || '');
    if (usesOldCounterTemplate) {
      return {
        ruleId: 'L1_WRITABLE_SIGNAL',
        success: false,
        anchor: 'counter-value',
        message: 'Excellent in TypeScript! But you still need to update the call in the HTML template.',
        hint: 'Open "counter.component.html" and change the interpolation from "{{ counter }}" to "{{ counter() }}" to invoke the signal.'
      };
    }

    return {
      ruleId: 'L1_WRITABLE_SIGNAL',
      success: true,
      anchor: 'counter-value',
      message: 'Excellent! "counter" is correctly declared and invoked as a Writable Signal.'
    };
  },

  L1_SIGNAL_INPUT: (analysis) => {
    const stepProp = analysis.properties.find(p => p.name === 'step');
    if (!stepProp) {
      return {
        ruleId: 'L1_SIGNAL_INPUT',
        success: false,
        anchor: 'step-input',
        message: 'The "step" property was not detected in your class.',
        hint: 'Make sure to declare the "step" property to represent the increment.'
      };
    }
    if (stepProp.type !== 'input') {
      return {
        ruleId: 'L1_SIGNAL_INPUT',
        success: false,
        anchor: 'step-input',
        message: 'The "step" property must be a modern Signal Input.',
        hint: 'Use Angular\'s "input" function: "step = input<number>(1);". Remember to import "input" from "@angular/core".'
      };
    }

    // Check template input syntax
    const usesOldStepTemplate = /{{\s*step\s*}}/.test(analysis.templateContent || '');
    if (usesOldStepTemplate) {
      return {
        ruleId: 'L1_SIGNAL_INPUT',
        success: false,
        anchor: 'step-input',
        message: 'TypeScript class is correct! But you need to update the interpolation of "step" in your template.',
        hint: 'Open "counter.component.html" and change "{{ step }}" to "{{ step() }}" in the informational text and inside the increment/decrement buttons.'
      };
    }

    return {
      ruleId: 'L1_SIGNAL_INPUT',
      success: true,
      anchor: 'step-input',
      message: 'Great! "step" is now a reactive Signal Input and is correctly invoked.'
    };
  },

  L1_COMPUTED_SIGNAL: (analysis) => {
    const doubleProp = analysis.properties.find(p => p.name === 'doubleCounter');
    if (!doubleProp) {
      return {
        ruleId: 'L1_COMPUTED_SIGNAL',
        success: false,
        anchor: 'double-value',
        message: 'The "doubleCounter" property was not detected in your class.',
        hint: 'Declare "doubleCounter" to reactively double the value of "counter".'
      };
    }
    if (doubleProp.type !== 'computed') {
      return {
        ruleId: 'L1_COMPUTED_SIGNAL',
        success: false,
        anchor: 'double-value',
        message: 'The "doubleCounter" property must be a Computed Signal.',
        hint: 'Use "doubleCounter = computed(() => this.counter() * 2);" importing "computed" from "@angular/core".'
      };
    }

    // Check template computed syntax
    const usesOldDoubleTemplate = /{{\s*doubleCounter\s*}}/.test(analysis.templateContent || '');
    if (usesOldDoubleTemplate) {
      return {
        ruleId: 'L1_COMPUTED_SIGNAL',
        success: false,
        anchor: 'double-value',
        message: 'Computed Signal is correct in TS! But you need to invoke it in the HTML.',
        hint: 'Open "counter.component.html" and change "{{ doubleCounter }}" to "{{ doubleCounter() }}".'
      };
    }

    return {
      ruleId: 'L1_COMPUTED_SIGNAL',
      success: true,
      anchor: 'double-value',
      message: 'Fantastic! "doubleCounter" is a Computed Signal that derives its state reactively and is invoked in the HTML.'
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
        message: `Anti-pattern detected: Manual recalculation of "doubleCounter" in method(s) [${methodNames.join(', ')}].`,
        hint: 'Since "doubleCounter" is a computed signal, it will update automatically. Remove the manual assignment "this.doubleCounter = ..." inside your methods.'
      };
    }
    return {
      ruleId: 'L1_NO_MANUAL_RECALCULATION',
      success: true,
      anchor: 'double-value',
      message: 'Excellent! No manual reassignments of derived state. You are following reactive architecture best practices.'
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
        message: 'The "tasks" property was not detected in your component.',
        hint: 'Make sure not to delete the "tasks" property when refactoring.'
      };
    }
    if (tasksProp.type !== 'signal') {
      return {
        ruleId: 'L2_TASKS_SIGNAL',
        success: false,
        anchor: 'task-list',
        message: 'The "tasks" property must be declared as a Writable Signal.',
        hint: 'Use: tasks = signal<Task[]>([...]);'
      };
    }
    return {
      ruleId: 'L2_TASKS_SIGNAL',
      success: true,
      anchor: 'task-list',
      message: 'Excellent! "tasks" is a reactive Writable Signal.'
    };
  },

  L2_FILTER_SIGNAL: (analysis) => {
    const filterProp = analysis.properties.find(p => p.name === 'filter');
    if (!filterProp) {
      return {
        ruleId: 'L2_FILTER_SIGNAL',
        success: false,
        anchor: 'filters-bar',
        message: 'The "filter" property was not detected in your component.',
        hint: 'Declare "filter" to control the state of the task filter.'
      };
    }
    if (filterProp.type !== 'signal') {
      return {
        ruleId: 'L2_FILTER_SIGNAL',
        success: false,
        anchor: 'filters-bar',
        message: 'The "filter" property must be declared as a Writable Signal.',
        hint: 'Use: filter = signal<\'all\' | \'pending\' | \'completed\'>(\'all\');'
      };
    }

    // Check template filter binding syntax: filter === 'all' or similar without function call
    const usesOldFilterTemplate = /filter\s*===\s*['"`]/.test(analysis.templateContent || '');
    if (usesOldFilterTemplate) {
      return {
        ruleId: 'L2_FILTER_SIGNAL',
        success: false,
        anchor: 'filters-bar',
        message: 'TS is correct! But you need to update the calls to "filter" in your HTML file.',
        hint: 'Open "task-filter.component.html" and change "filter === \'all\'" to "filter() === \'all\'" in all active style directives.'
      };
    }

    return {
      ruleId: 'L2_FILTER_SIGNAL',
      success: true,
      anchor: 'filters-bar',
      message: 'Excellent! The active filter is declared and implemented in the template as a signal.'
    };
  },

  L2_FILTERED_TASKS_COMPUTED: (analysis) => {
    const filteredProp = analysis.properties.find(p => p.name === 'filteredTasks');
    if (!filteredProp) {
      return {
        ruleId: 'L2_FILTERED_TASKS_COMPUTED',
        success: false,
        anchor: 'task-list',
        message: 'The "filteredTasks" property was not detected in your component.',
        hint: 'Define "filteredTasks" to reactively map the list of filtered tasks.'
      };
    }
    if (filteredProp.type !== 'computed') {
      return {
        ruleId: 'L2_FILTERED_TASKS_COMPUTED',
        success: false,
        anchor: 'task-list',
        message: 'The "filteredTasks" property must be a Computed Signal.',
        hint: 'Use: filteredTasks = computed(() => { ... });'
      };
    }

    // Check HTML iteration syntax: task of filteredTasks (without call)
    const usesOldFilteredTasksTemplate = /of\s+filteredTasks\b(?!(\s*\(\)))/.test(analysis.templateContent || '');
    if (usesOldFilteredTasksTemplate) {
      return {
        ruleId: 'L2_FILTERED_TASKS_COMPUTED',
        success: false,
        anchor: 'task-list',
        message: 'Computed Signal is correct in TS! But you need to invoke it in the @for loop of your HTML.',
        hint: 'Open "task-filter.component.html" and update the iteration to: "@for (task of filteredTasks(); track task.title)".'
      };
    }

    return {
      ruleId: 'L2_FILTERED_TASKS_COMPUTED',
      success: true,
      anchor: 'task-list',
      message: 'Perfect! filteredTasks reactively derives the state and is correctly iterated as a function in the template.'
    };
  },

  L2_PENDING_COUNT_COMPUTED: (analysis) => {
    const countProp = analysis.properties.find(p => p.name === 'pendingCount');
    if (!countProp) {
      return {
        ruleId: 'L2_PENDING_COUNT_COMPUTED',
        success: false,
        anchor: 'filters-bar',
        message: 'The "pendingCount" property was not detected in your component.',
        hint: 'Declare the "pendingCount" Computed Signal to derive the number of pending tasks.'
      };
    }
    if (countProp.type !== 'computed') {
      return {
        ruleId: 'L2_PENDING_COUNT_COMPUTED',
        success: false,
        anchor: 'filters-bar',
        message: 'The "pendingCount" property must be a Computed Signal.',
        hint: 'Use: pendingCount = computed(() => ...);'
      };
    }

    // Check HTML binding syntax: {{ pendingCount }}
    const usesOldPendingCountTemplate = /{{\s*pendingCount\s*}}/.test(analysis.templateContent || '');
    if (usesOldPendingCountTemplate) {
      return {
        ruleId: 'L2_PENDING_COUNT_COMPUTED',
        success: false,
        anchor: 'filters-bar',
        message: 'TypeScript is ready! But you still need to update the interpolation of "pendingCount" in the HTML.',
        hint: 'Open "task-filter.component.html" and change "{{ pendingCount }}" to "{{ pendingCount() }}" in the pending badge.'
      };
    }

    return {
      ruleId: 'L2_PENDING_COUNT_COMPUTED',
      success: true,
      anchor: 'filters-bar',
      message: 'Great! pendingCount is reactively derived and correctly outputted in the HTML.'
    };
  },

  L2_COMPLETED_COUNT_COMPUTED: (analysis) => {
    const countProp = analysis.properties.find(p => p.name === 'completedCount');
    if (!countProp) {
      return {
        ruleId: 'L2_COMPLETED_COUNT_COMPUTED',
        success: false,
        anchor: 'filters-bar',
        message: 'The "completedCount" property was not detected in your component.',
        hint: 'Declare the "completedCount" Computed Signal to derive the number of completed tasks.'
      };
    }
    if (countProp.type !== 'computed') {
      return {
        ruleId: 'L2_COMPLETED_COUNT_COMPUTED',
        success: false,
        anchor: 'filters-bar',
        message: 'The "completedCount" property must be a Computed Signal.',
        hint: 'Use: completedCount = computed(() => ...);'
      };
    }

    // Check HTML binding syntax: {{ completedCount }}
    const usesOldCompletedCountTemplate = /{{\s*completedCount\s*}}/.test(analysis.templateContent || '');
    if (usesOldCompletedCountTemplate) {
      return {
        ruleId: 'L2_COMPLETED_COUNT_COMPUTED',
        success: false,
        anchor: 'filters-bar',
        message: 'TypeScript is ready! But you still need to update the interpolation of "completedCount" in the HTML.',
        hint: 'Open "task-filter.component.html" and change "{{ completedCount }}" to "{{ completedCount() }}" in the completed badge.'
      };
    }

    return {
      ruleId: 'L2_COMPLETED_COUNT_COMPUTED',
      success: true,
      anchor: 'filters-bar',
      message: 'Great! completedCount is reactively derived and correctly outputted in the HTML.'
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
        message: 'The "theme" property was not detected in your component.',
        hint: 'Make sure you keep the "theme" property when refactoring.'
      };
    }
    if (themeProp.type !== 'signal') {
      return {
        ruleId: 'L3_THEME_SIGNAL',
        success: false,
        anchor: 'preferences-controls',
        message: 'The "theme" property must be declared as a Writable Signal.',
        hint: 'Use: theme = signal<\'dark\' | \'light\'>(\'dark\');'
      };
    }

    // Check template binding: theme === 'dark' or 'light'
    const usesOldThemeTemplate = /theme\s*===\s*['"`]/.test(analysis.templateContent || '');
    if (usesOldThemeTemplate) {
      return {
        ruleId: 'L3_THEME_SIGNAL',
        success: false,
        anchor: 'preferences-controls',
        message: 'TS is correct! But you need to update the theme calls in the HTML file.',
        hint: 'Open "theme-panel.component.html" and update "theme === \'dark\'" to "theme() === \'dark\'" and "theme === \'light\'" to "theme() === \'light\'".'
      };
    }

    return {
      ruleId: 'L3_THEME_SIGNAL',
      success: true,
      anchor: 'preferences-controls',
      message: 'Great! theme is a signal and is correctly invoked in the template.'
    };
  },

  L3_FONT_SIZE_SIGNAL: (analysis) => {
    const fontProp = analysis.properties.find(p => p.name === 'fontSize');
    if (!fontProp) {
      return {
        ruleId: 'L3_FONT_SIZE_SIGNAL',
        success: false,
        anchor: 'preferences-controls',
        message: 'The "fontSize" property was not detected in your component.',
        hint: 'Keep "fontSize" in order to size the preview font.'
      };
    }
    if (fontProp.type !== 'signal') {
      return {
        ruleId: 'L3_FONT_SIZE_SIGNAL',
        success: false,
        anchor: 'preferences-controls',
        message: 'The "fontSize" property must be declared as a Writable Signal.',
        hint: 'Use: fontSize = signal<number>(16);'
      };
    }

    // Check template binding: disabled="fontSize <= 14" or similar (without call)
    const usesOldFontSizeTemplate = /fontSize\s*(<=|>=|\+|-)\s*/.test(analysis.templateContent || '') || /{{\s*fontSize\s*}}/.test(analysis.templateContent || '');
    if (usesOldFontSizeTemplate) {
      return {
        ruleId: 'L3_FONT_SIZE_SIGNAL',
        success: false,
        anchor: 'preferences-controls',
        message: 'TS is correct! But you still need to invoke the font size signal in the HTML.',
        hint: 'Open "theme-panel.component.html" and update all expressions of "fontSize" to "fontSize()" (in the [disabled] conditions and in the {{ fontSize }}px display).'
      };
    }

    return {
      ruleId: 'L3_FONT_SIZE_SIGNAL',
      success: true,
      anchor: 'preferences-controls',
      message: 'Wonderful! fontSize is a Writable Signal and its call in the HTML is correct.'
    };
  },

  L3_ACCENT_COLOR_SIGNAL: (analysis) => {
    const accentProp = analysis.properties.find(p => p.name === 'accentColor');
    if (!accentProp) {
      return {
        ruleId: 'L3_ACCENT_COLOR_SIGNAL',
        success: false,
        anchor: 'preferences-controls',
        message: 'The "accentColor" property was not detected in your component.',
        hint: 'Keep "accentColor" to style the main accent color display.'
      };
    }
    if (accentProp.type !== 'signal') {
      return {
        ruleId: 'L3_ACCENT_COLOR_SIGNAL',
        success: false,
        anchor: 'preferences-controls',
        message: 'The "accentColor" property must be declared as a Writable Signal.',
        hint: 'Use: accentColor = signal<\'purple\' | \'cyan\' | \'pink\'>(\'purple\');'
      };
    }

    // Check template binding: accentColor === 'purple' etc. without call
    const usesOldAccentTemplate = /accentColor\s*===\s*['"`]/.test(analysis.templateContent || '');
    if (usesOldAccentTemplate) {
      return {
        ruleId: 'L3_ACCENT_COLOR_SIGNAL',
        success: false,
        anchor: 'preferences-controls',
        message: 'TypeScript is correct! But you still need to invoke "accentColor" in the HTML template.',
        hint: 'Open "theme-panel.component.html" and change "accentColor === \'purple\'" to "accentColor() === \'purple\'" (and repeat for \'cyan\' and \'pink\' on the palette circles).'
      };
    }

    return {
      ruleId: 'L3_ACCENT_COLOR_SIGNAL',
      success: true,
      anchor: 'preferences-controls',
      message: 'Great! The reactive accent color is correctly bound and invoked in the HTML template.'
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
        message: 'The private property "_items" was not detected in your CartService class.',
        hint: 'Declare the mutable signal as private using: private _items = signal<CartItem[]>([]);'
      };
    }
    if (privateProp.type !== 'signal') {
      return {
        ruleId: 'L4_SERVICE_PRIVATE_ITEMS',
        success: false,
        anchor: 'cart-summary',
        message: 'The private property "_items" must be a Writable Signal.',
        hint: 'Use the signal() function: private _items = signal<CartItem[]>([]);'
      };
    }
    return {
      ruleId: 'L4_SERVICE_PRIVATE_ITEMS',
      success: true,
      anchor: 'cart-summary',
      message: 'Excellent! "_items" is a pristine private writable signal.'
    };
  },

  L4_SERVICE_READONLY_ITEMS: (analysis) => {
    const publicProp = analysis.properties.find(p => p.name === 'items');
    if (!publicProp) {
      return {
        ruleId: 'L4_SERVICE_READONLY_ITEMS',
        success: false,
        anchor: 'cart-summary',
        message: 'The public property "items" was not detected in your CartService class.',
        hint: 'Make sure to expose the public property "items" for components.'
      };
    }
    const isReadonlyInit = publicProp.initializerText?.includes('asReadonly') || false;
    if (!isReadonlyInit) {
      return {
        ruleId: 'L4_SERVICE_READONLY_ITEMS',
        success: false,
        anchor: 'cart-summary',
        message: 'The public property "items" must be exposed as a read-only signal.',
        hint: 'Assign the public property like this to prevent direct mutations: items = this._items.asReadonly();'
      };
    }
    return {
      ruleId: 'L4_SERVICE_READONLY_ITEMS',
      success: true,
      anchor: 'cart-summary',
      message: 'Perfect! The exposed "items" state is protected with asReadonly() to guarantee immutability.'
    };
  },

  L4_PRODUCT_LIST_OUTPUT: (analysis) => {
    const outputProp = analysis.properties.find(p => p.name === 'productAdded');
    if (!outputProp) {
      return {
        ruleId: 'L4_PRODUCT_LIST_OUTPUT',
        success: false,
        anchor: 'cart-summary',
        message: 'The "productAdded" property was not detected in your ProductListComponent.',
        hint: 'Keep the addition emitter "productAdded" to notify clicks.'
      };
    }
    const usesOutputAPI = outputProp.initializerText?.includes('output(') || outputProp.initializerText?.includes('output<') || false;
    if (!usesOutputAPI) {
      return {
        ruleId: 'L4_PRODUCT_LIST_OUTPUT',
        success: false,
        anchor: 'cart-summary',
        message: 'The "productAdded" property must be declared using the new output() event API.',
        hint: 'Replace "@Output() productAdded = new EventEmitter..." with "productAdded = output<Product>();" importing "output" from "@angular/core".'
      };
    }
    return {
      ruleId: 'L4_PRODUCT_LIST_OUTPUT',
      success: true,
      anchor: 'cart-summary',
      message: 'Amazing! You are using the modern signal-based output() event API.'
    };
  },

  L4_PRODUCT_LIST_INJECTION: (analysis) => {
    const diProp = analysis.properties.find(p => p.name === 'cartService');
    if (!diProp) {
      return {
        ruleId: 'L4_PRODUCT_LIST_INJECTION',
        success: false,
        anchor: 'cart-summary',
        message: 'The "cartService" was not detected as injected in ProductListComponent.',
        hint: 'Inject the public or protected cartService property in your component.'
      };
    }
    const usesInject = diProp.initializerText?.includes('inject(') || false;
    if (!usesInject) {
      return {
        ruleId: 'L4_PRODUCT_LIST_INJECTION',
        success: false,
        anchor: 'cart-summary',
        message: 'You must inject "cartService" declaratively using the inject() API.',
        hint: 'Replace traditional constructor injection with: cartService = inject(CartService); and remove the constructor.'
      };
    }
    return {
      ruleId: 'L4_PRODUCT_LIST_INJECTION',
      success: true,
      anchor: 'cart-summary',
      message: 'Excellent! You are using functional dependency injection with inject() elegantly.'
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
        message: 'The "searchQuery" property was not detected in your component.',
        hint: 'Make sure to declare the searchQuery property to bind the search input text.'
      };
    }
    if (searchProp.type !== 'signal') {
      return {
        ruleId: 'L5_SEARCH_QUERY_SIGNAL',
        success: false,
        anchor: 'search-input',
        message: 'The "searchQuery" property must be declared as a Writable Signal.',
        hint: 'Use: searchQuery = signal<string>(\'\'); importing signal from @angular/core.'
      };
    }
    return {
      ruleId: 'L5_SEARCH_QUERY_SIGNAL',
      success: true,
      anchor: 'search-input',
      message: 'Excellent! "searchQuery" is a reactive Writable Signal.'
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
        message: 'The conversion of "searchQuery" to Observable using toObservable() was not detected.',
        hint: 'Use the toObservable(this.searchQuery) function from @angular/core/rxjs-interop to create an Observable stream.'
      };
    }
    return {
      ruleId: 'L5_TO_OBSERVABLE',
      success: true,
      anchor: 'search-input',
      message: 'Perfect! You have successfully converted the "searchQuery" Writable Signal to an Observable with toObservable().'
    };
  },

  L5_RXJS_OPERATORS: (analysis) => {
    const fileContent = analysis.fileContent || '';
    
    // If classic search is still active with searchSubject$, force rule failure
    const usesLegacySubject = /_?searchSubject\$\s*\.pipe/.test(fileContent);
    if (usesLegacySubject) {
      return {
        ruleId: 'L5_RXJS_OPERATORS',
        success: false,
        anchor: 'search-input',
        message: 'The classic Subject "searchSubject$" is still detected in the search stream.',
        hint: 'Refactor the stream to use toObservable(this.searchQuery) and get rid of searchSubject$.'
      };
    }

    const hasDebounce = /debounceTime\s*\(\s*\d+\s*\)/.test(fileContent);
    const hasDistinct = /distinctUntilChanged\s*\(\s*\)/.test(fileContent);
    const hasSwitchMap = /switchMap\s*\(/.test(fileContent);

    if (!hasDebounce) {
      return {
        ruleId: 'L5_RXJS_OPERATORS',
        success: false,
        anchor: 'search-input',
        message: 'The delay operator "debounceTime" is missing in the search stream.',
        hint: 'Apply .pipe(debounceTime(300), ...) to delay the search while the user types to avoid flooding the server.'
      };
    }
    if (!hasDistinct) {
      return {
        ruleId: 'L5_RXJS_OPERATORS',
        success: false,
        anchor: 'search-input',
        message: 'The "distinctUntilChanged" operator is missing in the search stream.',
        hint: 'Add distinctUntilChanged() to the pipe to avoid duplicate searches if the text hasn\'t actually changed.'
      };
    }
    if (!hasSwitchMap) {
      return {
        ruleId: 'L5_RXJS_OPERATORS',
        success: false,
        anchor: 'search-input',
        message: 'The asynchronous flattening operator "switchMap" is missing in the search stream.',
        hint: 'Use switchMap(query => this.searchService.search(query)) to cancel previous in-flight searches if a new one is initiated.'
      };
    }

    return {
      ruleId: 'L5_RXJS_OPERATORS',
      success: true,
      anchor: 'search-input',
      message: 'Spectacular! You are implementing best practices for optimizing async streams with debounceTime, distinctUntilChanged, and switchMap.'
    };
  },

  L5_TO_SIGNAL: (analysis) => {
    const resultsProp = analysis.properties.find(p => p.name === 'searchResults');
    if (!resultsProp) {
      return {
        ruleId: 'L5_TO_SIGNAL',
        success: false,
        anchor: 'results-panel',
        message: 'The "searchResults" property was not detected in your class.',
        hint: 'Make sure to define the "searchResults" property to store the search results.'
      };
    }
    const usesToSignal = resultsProp.initializerText?.includes('toSignal(') || false;
    if (!usesToSignal) {
      return {
        ruleId: 'L5_TO_SIGNAL',
        success: false,
        anchor: 'results-panel',
        message: 'The "searchResults" property must be converted to a Signal using toSignal().',
        hint: 'Use the toSignal(queryObservable) function imported from @angular/core/rxjs-interop to transform the final observable into a signal.'
      };
    }
    const hasInitialValue = resultsProp.initializerText?.includes('initialValue') || false;
    if (!hasInitialValue) {
      return {
        ruleId: 'L5_TO_SIGNAL',
        success: false,
        anchor: 'results-panel',
        message: 'You have not specified a safe "initialValue" when using toSignal().',
        hint: 'To prevent "searchResults()" from returning undefined before the first value is emitted, add the option: toSignal(..., { initialValue: [] })'
      };
    }
    return {
      ruleId: 'L5_TO_SIGNAL',
      success: true,
      anchor: 'results-panel',
      message: 'Brilliant! You have closed the reactive gap by converting the stream back to a read-only "searchResults" signal and protecting it with an initialValue.'
    };
  }
};

// Rules catalog for Level 6 Signal Stores
export const L6_RULES: Record<string, PedagogicalRule> = {
  L6_STORE_DECLARATION: (analysis) => {
    const fileContent = analysis.fileContent || '';
    const hasSignalStore = /signalStore\s*\(/.test(fileContent);
    if (!hasSignalStore) {
      return {
        ruleId: 'L6_STORE_DECLARATION',
        success: false,
        anchor: 'messages-list-anchor',
        message: 'The store declaration using @ngrx/signals\' signalStore() function was not detected.',
        hint: 'Declare your store in messages-store.ts using: export const MessagesStore = signalStore(...);'
      };
    }
    return {
      ruleId: 'L6_STORE_DECLARATION',
      success: true,
      anchor: 'messages-list-anchor',
      message: 'Excellent! You declared your centralized store using the signalStore() function.'
    };
  },

  L6_STORE_STATE: (analysis) => {
    const fileContent = analysis.fileContent || '';
    const hasWithState = /withState\s*\(/.test(fileContent);
    if (!hasWithState) {
      return {
        ruleId: 'L6_STORE_STATE',
        success: false,
        anchor: 'messages-list-anchor',
        message: 'The initial state configuration was not found in the Store.',
        hint: 'Use the withState() function to configure the initial state: withState({ messages: [] as Message[], filter: \'all\' as \'all\' | \'unread\', loading: false })'
      };
    }
    return {
      ruleId: 'L6_STORE_STATE',
      success: true,
      anchor: 'messages-list-anchor',
      message: 'Great! The initial state of the store is perfectly configured with withState().'
    };
  },

  L6_STORE_COMPUTED: (analysis) => {
    const fileContent = analysis.fileContent || '';
    const hasWithComputed = /withComputed\s*\(/.test(fileContent);
    if (!hasWithComputed) {
      return {
        ruleId: 'L6_STORE_COMPUTED',
        success: false,
        anchor: 'messages-list-anchor',
        message: 'The mapping of computed derived states was not detected in your Store.',
        hint: 'Declare your computed states using withComputed((store) => ({ filteredMessages: computed(() => ...), unreadCount: computed(() => ...) }))'
      };
    }
    const hasFilteredMessages = /filteredMessages\s*:\s*computed\(/.test(fileContent);
    const hasUnreadCount = /unreadCount\s*:\s*computed\(/.test(fileContent);
    if (!hasFilteredMessages || !hasUnreadCount) {
      return {
        ruleId: 'L6_STORE_COMPUTED',
        success: false,
        anchor: 'messages-list-anchor',
        message: 'The computed properties "filteredMessages" or "unreadCount" are missing in your Store.',
        hint: 'Make sure you compute filteredMessages (filtering by read/unread messages) and unreadCount (total number of unread messages).'
      };
    }
    return {
      ruleId: 'L6_STORE_COMPUTED',
      success: true,
      anchor: 'messages-list-anchor',
      message: 'Spectacular! You declare and derive efficient computed states using withComputed().'
    };
  },

  L6_STORE_METHODS: (analysis) => {
    const fileContent = analysis.fileContent || '';
    const hasWithMethods = /withMethods\s*\(/.test(fileContent);
    if (!hasWithMethods) {
      return {
        ruleId: 'L6_STORE_METHODS',
        success: false,
        anchor: 'messages-list-anchor',
        message: 'State manipulation methods were not found in your Store.',
        hint: 'Use withMethods((store) => ({ loadMessages(), setFilter(), markAsRead() })) to expose immutable operations.'
      };
    }
    const hasPatchState = /patchState\s*\(/.test(fileContent);
    if (!hasPatchState) {
      return {
        ruleId: 'L6_STORE_METHODS',
        success: false,
        anchor: 'messages-list-anchor',
        message: 'The use of the patchState() function to update the Store immutably was not detected.',
        hint: 'Import patchState from @ngrx/signals and use it to perform partial updates in your methods: patchState(store, { filter }) or patchState(store, (state) => ({ ... }))'
      };
    }
    return {
      ruleId: 'L6_STORE_METHODS',
      success: true,
      anchor: 'messages-list-anchor',
      message: 'Brilliant! You expose controlled operations and update the state immutably with patchState().'
    };
  }
};

// Rules catalog for Level 7 Zone-less Angular
export const L7_RULES: Record<string, PedagogicalRule> = {
  L7_ZONELESS_PROVIDER: (analysis) => {
    const fileContent = analysis.fileContent || '';
    const hasZoneless = /provideExperimentalZonelessChangeDetection\s*\(\s*\)/.test(fileContent);
    const hasZone = /provideZoneChangeDetection\s*\(/.test(fileContent);

    if (!hasZoneless || hasZone) {
      return {
        ruleId: 'L7_ZONELESS_PROVIDER',
        success: false,
        anchor: 'zoneless-provider-anchor',
        message: 'The experimental zoneless change detection provider was not detected in your global configuration.',
        hint: 'Replace "provideZoneChangeDetection({ eventCoalescing: true })" with "provideExperimentalZonelessChangeDetection()" in app.config.ts and import it from "@angular/core".'
      };
    }
    return {
      ruleId: 'L7_ZONELESS_PROVIDER',
      success: true,
      anchor: 'zoneless-provider-anchor',
      message: 'Excellent! You configured Angular in pure Zone-less mode using provideExperimentalZonelessChangeDetection().'
    };
  },

  L7_ON_PUSH_STRATEGY: (analysis) => {
    const fileContent = analysis.fileContent || '';
    const hasOnPush = /changeDetection\s*:\s*ChangeDetectionStrategy\.OnPush/.test(fileContent);

    if (!hasOnPush) {
      return {
        ruleId: 'L7_ON_PUSH_STRATEGY',
        success: false,
        anchor: 'onpush-strategy-anchor',
        message: 'The component does not use the OnPush change detection strategy.',
        hint: 'Add "changeDetection: ChangeDetectionStrategy.OnPush" to the @Component decorator in your performance-monitor.component.ts. Import ChangeDetectionStrategy from "@angular/core".'
      };
    }
    return {
      ruleId: 'L7_ON_PUSH_STRATEGY',
      success: true,
      anchor: 'onpush-strategy-anchor',
      message: 'Excellent! Configuring OnPush is a best practice and vital for high-performance applications.'
    };
  },

  L7_AFTER_RENDER_HOOK: (analysis) => {
    const fileContent = analysis.fileContent || '';
    const hasAfterRender = /afterRender\s*\(/.test(fileContent) || /afterNextRender\s*\(/.test(fileContent);
    const hasAfterViewChecked = /ngAfterViewChecked\s*\(/.test(fileContent) || /implements\s+[^]*AfterViewChecked/.test(fileContent);

    if (hasAfterViewChecked) {
      return {
        ruleId: 'L7_AFTER_RENDER_HOOK',
        success: false,
        anchor: 'after-render-anchor',
        message: 'You are still using the traditional ngAfterViewChecked lifecycle hook, which can trigger infinite loops or excessive rendering operations in Zoneless environments.',
        hint: 'Remove the ngAfterViewChecked method and "implements AfterViewChecked" from the component. Instead, use afterRender or afterNextRender in the constructor.'
      };
    }

    if (!hasAfterRender) {
      return {
        ruleId: 'L7_AFTER_RENDER_HOOK',
        success: false,
        anchor: 'after-render-anchor',
        message: 'The use of afterRender or afterNextRender was not detected in the constructor of the component.',
        hint: 'Import afterRender or afterNextRender from "@angular/core" and run it in the constructor to safely interact with the Canvas/DOM: afterRender(() => { ... })'
      };
    }

    return {
      ruleId: 'L7_AFTER_RENDER_HOOK',
      success: true,
      anchor: 'after-render-anchor',
      message: 'Magnificent! You use afterRender/afterNextRender to ensure that DOM/Canvas manipulation occurs strictly after Angular has finished writing to the DOM, avoiding layout trashing.'
    };
  },

  L7_STATE_SIGNALS: (analysis) => {
    const fpsListProp = analysis.properties.find(p => p.name === 'fpsList');
    const averageFpsProp = analysis.properties.find(p => p.name === 'averageFps');
    const logsProp = analysis.properties.find(p => p.name === 'logs');

    if (!fpsListProp) {
      return {
        ruleId: 'L7_STATE_SIGNALS',
        success: false,
        anchor: 'state-signals-anchor',
        message: 'The "fpsList" property was not detected in your component.',
        hint: 'Keep the "fpsList" property when refactoring to store the frame history.'
      };
    }
    
    if (fpsListProp.type !== 'signal') {
      return {
        ruleId: 'L7_STATE_SIGNALS',
        success: false,
        anchor: 'state-signals-anchor',
        message: 'The "fpsList" property must be a Writable Signal.',
        hint: 'Declare fpsList as a reactive signal: fpsList = signal<number[]>([]);'
      };
    }

    if (!averageFpsProp) {
      return {
        ruleId: 'L7_STATE_SIGNALS',
        success: false,
        anchor: 'state-signals-anchor',
        message: 'The "averageFps" property was not detected in your component.',
        hint: 'Make sure to define "averageFps" to display the average FPS.'
      };
    }

    if (averageFpsProp.type !== 'computed') {
      return {
        ruleId: 'L7_STATE_SIGNALS',
        success: false,
        anchor: 'state-signals-anchor',
        message: 'The "averageFps" property must be a derived Computed Signal.',
        hint: 'Define averageFps using the computed function: averageFps = computed(() => { ... }); which calculates the average of the fpsList() array.'
      };
    }

    if (!logsProp) {
      return {
        ruleId: 'L7_STATE_SIGNALS',
        success: false,
        anchor: 'state-signals-anchor',
        message: 'The "logs" property was not detected in your component.',
        hint: 'Make sure to keep the "logs" property to record activity.'
      };
    }

    if (logsProp.type !== 'signal') {
      return {
        ruleId: 'L7_STATE_SIGNALS',
        success: false,
        anchor: 'state-signals-anchor',
        message: 'The "logs" property must be a Writable Signal.',
        hint: 'Declare logs as a reactive signal: logs = signal<string[]>([]);'
      };
    }

    // Verify in HTML if normal interpolation {{ averageFps }} is used instead of invoking the signal.
    const usesOldAverageFpsTemplate = /{{\s*averageFps\s*}}/.test(analysis.templateContent || '');
    if (usesOldAverageFpsTemplate) {
      return {
        ruleId: 'L7_STATE_SIGNALS',
        success: false,
        anchor: 'state-signals-anchor',
        message: 'TypeScript structure is correct! But the interpolation of "averageFps" needs to be updated in the HTML.',
        hint: 'Modify "performance-monitor.component.html" to invoke the computed signal: "{{ averageFps() }}".'
      };
    }

    const usesOldLogsTemplate = /of\s+logs\b(?!(\s*\(\)))/.test(analysis.templateContent || '');
    if (usesOldLogsTemplate) {
      return {
        ruleId: 'L7_STATE_SIGNALS',
        success: false,
        anchor: 'state-signals-anchor',
        message: 'TypeScript structure is correct! But the @for directive for "logs" needs to be updated in the HTML.',
        hint: 'Modify "performance-monitor.component.html" to iterate over the signal: "@for (log of logs(); track log)".'
      };
    }

    return {
      ruleId: 'L7_STATE_SIGNALS',
      success: true,
      anchor: 'state-signals-anchor',
      message: 'Excellent! The performance state is modeled entirely with reactive Signals.'
    };
  }
};

export function evaluateRules(analysis: AnalysisResult, ruleIds: string[]): RulesEvaluationResult {
  const evaluations: RuleEvaluation[] = [];
  let isValid = true;

  // We create a copy of analysis to avoid mutating the original object, and clean
  // comments in its fileContent to avoid false matches with commented code (hints)
  const cleanAnalysis = {
    ...analysis,
    fileContent: analysis.fileContent
      ? analysis.fileContent
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/^[ \t]*\/\/.*$/gm, '')
      : ''
  };

  ruleIds.forEach(id => {
    // Resolve rule from corresponding catalog
    const rule = L1_RULES[id] || L2_RULES[id] || L3_RULES[id] || L4_RULES[id] || L5_RULES[id] || L6_RULES[id] || L7_RULES[id];
    if (rule) {
      const evaluation = rule(cleanAnalysis);
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

