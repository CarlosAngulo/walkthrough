import '../../../test-setup';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ThemePanelComponent } from './theme-panel.component';
import { isSignal } from '@angular/core';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Import our custom Vitest matchers to extend expect
import '@learning-engine/test-integration';

describe('Level 3: Effect Architecture 💾 - ThemePanelComponent', () => {
  let component: ThemePanelComponent;
  let fixture: ComponentFixture<ThemePanelComponent>;

  describe('Architectural Structure - AST Semantic Analysis 🧬', () => {
    it('should comply with all reactive design rules and avoid anti-patterns', () => {
      const componentPath = 'src/app/course/level3-effects/theme-panel.component.ts';
      
      expect(componentPath).toSatisfyRules([
        'L3_THEME_SIGNAL',
        'L3_FONT_SIZE_SIGNAL',
        'L3_ACCENT_COLOR_SIGNAL'
      ]);
    });
  });

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Configure fake timers in Vitest to simulate time
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function createComponent() {
    await TestBed.configureTestingModule({
      imports: [ThemePanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  describe('CHALLENGE 1: Configuration Variables as Signals', () => {
    it('should declare "theme", "fontSize" and "accentColor" as Angular Writable Signals', async () => {
      await createComponent();

      expect(component.theme).toBeDefined();
      expect(component.fontSize).toBeDefined();
      expect(component.accentColor).toBeDefined();

      expect(isSignal(component.theme)).withContext(
        'Alert! "theme" must be a mutable Angular Signal. Replace it using the function: signal("dark").'
      ).toBe(true);

      expect(isSignal(component.fontSize)).withContext(
        'Alert! "fontSize" must be a mutable Angular Signal. Replace it using the function: signal(16).'
      ).toBe(true);

      expect(isSignal(component.accentColor)).withContext(
        'Alert! "accentColor" must be a mutable Angular Signal. Replace it using the function: signal("primary").'
      ).toBe(true);
    });

    it('should initialize signals with their default values', async () => {
      await createComponent();

      expect((component.theme as any)()).toBe('dark');
      expect((component.fontSize as any)()).toBe(16);
      expect((component.accentColor as any)()).toBe('primary');
    });
  });

  describe('CHALLENGE 2: Initialization from LocalStorage', () => {
    it('should load previous preferences from localStorage if they exist on startup', async () => {
      // Simulate previous storage
      const savedPrefs = {
        theme: 'light',
        fontSize: 20,
        accentColor: 'secondary'
      };
      localStorage.setItem('academy-theme-preferences', JSON.stringify(savedPrefs));

      // Create component now
      await createComponent();

      expect((component.theme as any)()).withContext(
        'The component should have read "theme" from localStorage and loaded "light".'
      ).toBe('light');

      expect((component.fontSize as any)()).withContext(
        'The component should have read "fontSize" from localStorage and loaded 20.'
      ).toBe(20);

      expect((component.accentColor as any)()).withContext(
        'The component should have read "accentColor" from localStorage and loaded "secondary".'
      ).toBe('secondary');
    });
  });

  describe('CHALLENGE 3: Effect() to Synchronize State (LocalStorage and DOM)', () => {
    it('should persist automatically in localStorage every time signals change', async () => {
      await createComponent();

      if (isSignal(component.theme) && typeof (component.theme as any).set === 'function') {
        // Initially should be saved in localStorage by the first run of the effect
        let saved = JSON.parse(localStorage.getItem('academy-theme-preferences') || '{}');
        expect(saved.theme).toBe('dark');

        // Change signals
        (component.theme as any).set('light');
        (component.fontSize as any).set(22);
        (component.accentColor as any).set('neutral');
        
        // Propagate changes
        fixture.detectChanges();
        
        // Give the Angular effects a microtask cycle to execute
        await fixture.whenStable();

        // Verify localStorage
        saved = JSON.parse(localStorage.getItem('academy-theme-preferences') || '{}');
        expect(saved.theme).withContext('effect() should have saved the new theme in localStorage.').toBe('light');
        expect(saved.fontSize).withContext('effect() should have saved the new font size in localStorage.').toBe(22);
        expect(saved.accentColor).withContext('effect() should have saved the new color in localStorage.').toBe('neutral');
      } else {
        expect.fail('Cannot test automatic persistence because properties are not signals yet.');
      }
    });

    it('should reactively synchronize CSS properties of the Preview Card in the DOM', async () => {
      await createComponent();

      // Create preview element in the test fixture DOM if necessary
      const cardEl = fixture.nativeElement.querySelector('.theme-preview-card') || document.querySelector('.theme-preview-card');
      
      if (isSignal(component.theme) && cardEl) {
        (component.theme as any).set('light');
        (component.fontSize as any).set(18);
        (component.accentColor as any).set('secondary');

        fixture.detectChanges();
        await fixture.whenStable();

        // Verify DOM
        expect(cardEl.style.getPropertyValue('--preview-font-size')).toBe('18px');
        expect(cardEl.getAttribute('data-preview-theme')).toBe('light');
        expect(cardEl.getAttribute('data-preview-accent')).toBe('secondary');
      } else {
        expect.fail('Cannot test DOM synchronization because there are no signals or the preview card did not render.');
      }
    });
  });

  describe('CHALLENGE 4: onCleanup for Analytical Timers (Debounce)', () => {
    it('should delay the analytics report by applying an 800ms debounce', async () => {
      await createComponent();

      if (isSignal(component.theme) && typeof (component.theme as any).set === 'function') {
        expect(component.analyticsLogCount).toBe(0);

        // Trigger change
        (component.theme as any).set('light');
        fixture.detectChanges();
        await fixture.whenStable();

        // Advance clock 400ms (half the debounce). Should not report yet.
        vi.advanceTimersByTime(400);
        expect(component.analyticsLogCount).withContext(
          'Debounce active: After 400ms, the analytics count should not increase yet.'
        ).toBe(0);

        // Advance another 400ms (total 800ms). Now it should report.
        vi.advanceTimersByTime(400);
        expect(component.analyticsLogCount).withContext(
          'Debounce completed: After 800ms, the analytics report should have run once.'
        ).toBe(1);
      } else {
        expect.fail('Cannot evaluate analytics because properties are not signals.');
      }
    });

    it('should cancel previous timers using onCleanup upon multiple fast changes', async () => {
      await createComponent();

      if (isSignal(component.theme) && typeof (component.theme as any).set === 'function') {
        expect(component.analyticsLogCount).toBe(0);

        // Series of extremely rapid changes (less than 800ms between them)
        (component.theme as any).set('light');
        fixture.detectChanges(); await fixture.whenStable();
        vi.advanceTimersByTime(300); // 300ms elapsed

        (component.fontSize as any).set(18);
        fixture.detectChanges(); await fixture.whenStable();
        vi.advanceTimersByTime(300); // 600ms total elapsed, but the new timer has only run 300ms

        (component.accentColor as any).set('neutral');
        fixture.detectChanges(); await fixture.whenStable();
        
        // Advance 500ms more (first timer would have expired, but should be canceled thanks to onCleanup)
        vi.advanceTimersByTime(500);
        expect(component.analyticsLogCount).withContext(
          'onCleanup failed: Timers from previous changes were not canceled, causing premature analytics logs.'
        ).toBe(0);

        // Advance 300ms more (total 800ms since last change)
        vi.advanceTimersByTime(300);
        expect(component.analyticsLogCount).withContext(
          'Excellent! onCleanup successfully canceled previous timers and only reported the final state once after 800ms.'
        ).toBe(1);
      } else {
        expect.fail('Cannot evaluate rapid analytics without signals.');
      }
    });
  });

  describe('Architectural Analysis (Healthy Effects) 🧐', () => {
    it('should not mutate or write to observable signals within effect()', () => {
      const filePath = resolve(__dirname, 'theme-panel.component.ts');
      const code = readFileSync(filePath, 'utf-8');

      // Check if constructor or effect contains calls to `.set(` or `.update(`
      // on observed properties within the effect block.
      // Writing to the same signal we observe causes an infinite loop.
      
      const lines = code.split('\n');
      let insideConstructor = false;
      let constructorBrackets = 0;
      let cyclicCallsCount = 0;

      for (const line of lines) {
        if (
          line.includes('constructor(') || 
          line.includes('constructor ()') || 
          line.includes('setupThemeEffects(') || 
          line.includes('setupThemeEffects ()')
        ) {
          insideConstructor = true;
        }
        if (insideConstructor) {
          if (line.includes('{')) constructorBrackets++;
          if (line.includes('}')) constructorBrackets--;

          // Search for recursive mutation calls on our signals
          if (
            line.includes('this.theme.set') || 
            line.includes('this.fontSize.set') || 
            line.includes('this.accentColor.set') ||
            line.includes('this.theme.update') || 
            line.includes('this.fontSize.update') || 
            line.includes('this.accentColor.update')
          ) {
            cyclicCallsCount++;
          }

          if (constructorBrackets === 0 && line.includes('}')) {
            insideConstructor = false;
          }
        }
      }

      expect(cyclicCallsCount).withContext(
        'Architectural Alert! You have called write methods (.set or .update) on your signals within the constructor/effect(). This can generate infinite recursion (reactive loops) and browser crashes. Effects must be read-only for signals in their own context.'
      ).toBe(0);
    });

    it('should not declare computed() inside an effect()', () => {
      const filePath = resolve(__dirname, 'theme-panel.component.ts');
      const code = readFileSync(filePath, 'utf-8');

      // Detect if "computed(" appears inside "effect("
      const lines = code.split('\n');
      let insideConstructor = false;
      let constructorBrackets = 0;
      let computedInsideConstructor = false;

      for (const line of lines) {
        if (
          line.includes('constructor(') || 
          line.includes('constructor ()') || 
          line.includes('setupThemeEffects(') || 
          line.includes('setupThemeEffects ()')
        ) {
          insideConstructor = true;
        }
        if (insideConstructor) {
          if (line.includes('{')) constructorBrackets++;
          if (line.includes('}')) constructorBrackets--;

          if (line.includes('computed(') || line.includes('computed (')) {
            computedInsideConstructor = true;
          }

          if (constructorBrackets === 0 && line.includes('}')) {
            insideConstructor = false;
          }
        }
      }

      expect(computedInsideConstructor).withContext(
        'Architectural Alert! You must not declare computed signals (computed(...)) inside an effect() block. Computed properties are defined declaratively as class properties, not inside side effects.'
      ).toBe(false);
    });
  });
});
