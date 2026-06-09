import '../../../test-setup';
import { describe, it, expect } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CounterComponent } from './counter.component';
import { isSignal } from '@angular/core';

// Import our custom Vitest matchers to extend expect
import '@learning-engine/test-integration';

describe('Angular Signals - Test-Driven Learning 🚀', () => {
  let component: CounterComponent;
  let fixture: ComponentFixture<CounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CounterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Architectural Structure - AST Semantic Analysis 🧬', () => {
    it('should comply with all reactive design rules and avoid anti-patterns', () => {
      // Path is relative to the apps/academy directory where tests run
      const componentPath = 'src/app/course/level1-counter/counter.component.ts';
      
      expect(componentPath).toSatisfyRules([
        'L1_WRITABLE_SIGNAL',
        'L1_SIGNAL_INPUT',
        'L1_COMPUTED_SIGNAL',
        'L1_NO_MANUAL_RECALCULATION'
      ]);
    });
  });

  describe('CHALLENGE 1: Writable Signals', () => {
    it('should declare "counter" as an Angular Writable Signal initialized to 0', () => {
      expect(component.counter).toBeDefined();
      
      const isSignalResult = isSignal(component.counter);
      expect(isSignalResult).withContext(
        'Oh no! "counter" must be an Angular Signal. Make sure to initialize it using the function: signal(0).'
      ).toBe(true);

      expect(component.counter()).withContext(
        'The initial value of the "counter" signal must be 0.'
      ).toBe(0);
    });
  });

  describe('CHALLENGE 2: Signal Inputs (Transformation)', () => {
    it('should declare "step" as an Angular Signal Input with a default value of 1', () => {
      expect(component.step).toBeDefined();

      const isSignalResult = isSignal(component.step);
      expect(isSignalResult).withContext(
        'Good attempt! "step" must be a modern Angular Signal Input. Use the input(1) function to declare it, replacing the old value.'
      ).toBe(true);

      expect(component.step()).withContext(
        'The default value of the "step" Signal Input must be 1.'
      ).toBe(1);
    });

    it('should react correctly to changes in the input dynamically', () => {
      fixture.componentRef.setInput('step', 5);
      fixture.detectChanges();

      expect(component.step()).withContext(
        'The "step" Signal Input should have updated its value to 5 reactively.'
      ).toBe(5);
    });
  });

  describe('CHALLENGE 3: Computed Signals', () => {
    it('should declare "doubleCounter" as an Angular Computed Signal', () => {
      expect(component.doubleCounter).toBeDefined();

      const isSignalResult = isSignal(component.doubleCounter);
      expect(isSignalResult).withContext(
        'Almost there! "doubleCounter" must be a Computed Signal. Initialize it using computed(...).'
      ).toBe(true);
    });

    it('should return double the value of "counter" automatically', () => {
      if (isSignal(component.counter) && typeof (component.counter as any).set === 'function') {
        (component.counter as any).set(5);
        fixture.detectChanges();
        
        expect(component.doubleCounter()).withContext(
          'Attention! "doubleCounter" should return 10 when "counter" is 5 (double).'
        ).toBe(10);

        (component.counter as any).set(12);
        fixture.detectChanges();

        expect(component.doubleCounter()).withContext(
          'Attention! "doubleCounter" should return 24 when "counter" is 12.'
        ).toBe(24);
      } else {
        expect.fail('Cannot test doubleCounter because "counter" is not a valid Writable Signal yet.');
      }
    });
  });

  describe('CHALLENGE 4: State Mutation', () => {
    it('should increment the value of "counter" by adding the value of "step()" when calling increment()', () => {
      if (isSignal(component.counter) && typeof (component.counter as any).set === 'function') {
        (component.counter as any).set(10);
        fixture.detectChanges();

        component.increment();
        fixture.detectChanges();
        expect(component.counter()).withContext(
          'When calling increment() with step = 1, counter should go from 10 to 11.'
        ).toBe(11);

        fixture.componentRef.setInput('step', 5);
        fixture.detectChanges();

        component.increment();
        fixture.detectChanges();
        expect(component.counter()).withContext(
          'When calling increment() with step = 5, counter should go from 11 to 16.'
        ).toBe(16);
      } else {
        expect.fail('Cannot test increment() because "counter" is not a valid Writable Signal yet.');
      }
    });

    it('should decrement the value of "counter" by subtracting the value of "step()" when calling decrement()', () => {
      if (isSignal(component.counter) && typeof (component.counter as any).set === 'function') {
        (component.counter as any).set(20);
        fixture.detectChanges();

        component.decrement();
        fixture.detectChanges();
        expect(component.counter()).withContext(
          'When calling decrement() with step = 1, counter should go from 20 to 19.'
        ).toBe(19);

        fixture.componentRef.setInput('step', 7);
        fixture.detectChanges();

        component.decrement();
        fixture.detectChanges();
        expect(component.counter()).withContext(
          'When calling decrement() with step = 7, counter should go from 19 to 12.'
        ).toBe(12);
      } else {
        expect.fail('Cannot test decrement() because "counter" is not a valid Writable Signal yet.');
      }
    });
  });
});
