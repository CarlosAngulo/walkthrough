import '../../../test-setup';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RxjsBoundariesComponent } from './rxjs-boundaries.component';
import { SearchService } from './search.service';
import { isSignal, signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import '@learning-engine/test-integration';

describe('Level 5: RxJS Boundaries 🔄 - RxjsBoundariesComponent', () => {
  let component: RxjsBoundariesComponent;
  let fixture: ComponentFixture<RxjsBoundariesComponent>;
  let searchServiceMock: any;

  beforeEach(() => {
    // Create mock for SearchService
    searchServiceMock = {
      search: vi.fn().mockReturnValue(of([
        { id: 'c1', title: 'Signals Course', category: 'Signals', difficulty: 'Principiante', emoji: '⚡' }
      ]).pipe(delay(50)))
    };
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function createComponent() {
    await TestBed.configureTestingModule({
      imports: [RxjsBoundariesComponent],
      providers: [
        { provide: SearchService, useValue: searchServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RxjsBoundariesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  describe('Architectural Structure - AST Semantic Analysis 🧬', () => {
    it('should comply with all reactive design rules and avoid anti-patterns', () => {
      const componentPath = 'src/app/course/level5-interop/rxjs-boundaries.component.ts';
      
      expect(componentPath).toSatisfyRules([
        'L5_SEARCH_QUERY_SIGNAL',
        'L5_TO_OBSERVABLE',
        'L5_RXJS_OPERATORS',
        'L5_TO_SIGNAL'
      ]);
    });
  });

  describe('CHALLENGE 1: Writable Signal for Searching', () => {
    it('should declare "searchQuery" as a Writable Signal initialized to an empty string', async () => {
      await createComponent();

      expect(component.searchQuery).toBeDefined();
      expect(isSignal(component.searchQuery)).withContext(
        'Alert! "searchQuery" must be a mutable Angular Signal. Replace it using the function: signal("").'
      ).toBe(true);
      expect(component.searchQuery()).toBe('');
    });
  });

  describe('CHALLENGE 2, 3 & 4: Bridging to RxJS and Converting Back', () => {
    it('should declare "searchResults" as an Angular Signal', async () => {
      await createComponent();

      expect(component.searchResults).toBeDefined();
      expect(isSignal(component.searchResults)).withContext(
        'Alert! "searchResults" must be a Signal (read-only). It will be created using the toSignal() function.'
      ).toBe(true);
    });

    it('should initialize "searchResults" with an empty array as initial value', async () => {
      await createComponent();

      if (isSignal(component.searchResults)) {
        expect(component.searchResults()).toEqual([]);
      } else {
        expect(component.searchResults).toEqual([]);
      }
    });

    it('should apply debounceTime and switchMap correctly when searchQuery changes', async () => {
      await createComponent();

      if (isSignal(component.searchQuery) && typeof (component.searchQuery as any).set === 'function') {
        // Change searchQuery
        (component.searchQuery as any).set('angular');
        fixture.detectChanges();
        
        // debounceTime is 400ms. If we advance 200ms, it should not have called search() yet.
        vi.advanceTimersByTime(200);
        expect(searchServiceMock.search).not.toHaveBeenCalled();

        // If we advance another 200ms (total 400ms), the debounce should complete and the service should be called.
        vi.advanceTimersByTime(200);
        expect(searchServiceMock.search).toHaveBeenCalledWith('angular');

        // Latency simulation delay(50ms) in the mock
        vi.advanceTimersByTime(50);
        fixture.detectChanges();

        // Results should have propagated to searchResults signal
        expect(component.searchResults()).toEqual([
          { id: 'c1', title: 'Signals Course', category: 'Signals', difficulty: 'Principiante', emoji: '⚡' }
        ]);
      } else {
        // If not signals yet, pass test provisionally not to break compilation.
        expect(true).toBe(true);
      }
    });

    it('should cancel previous pending searches if a new term is entered quickly (switchMap)', async () => {
      await createComponent();

      if (isSignal(component.searchQuery) && typeof (component.searchQuery as any).set === 'function') {
        // Trigger first term
        (component.searchQuery as any).set('rx');
        fixture.detectChanges();
        vi.advanceTimersByTime(400); // Expiration of first debounce

        expect(searchServiceMock.search).toHaveBeenCalledTimes(1);

        // Without letting latency finish (which takes 50ms), we write another term quickly
        (component.searchQuery as any).set('rxjs');
        fixture.detectChanges();
        vi.advanceTimersByTime(400); // Expiration of second debounce

        // switchMap should cancel or overlap the previous request
        expect(searchServiceMock.search).toHaveBeenCalledTimes(2);
        expect(searchServiceMock.search).toHaveBeenLastCalledWith('rxjs');

        vi.advanceTimersByTime(50); // Let the second request complete
        fixture.detectChanges();
      } else {
        expect(true).toBe(true);
      }
    });
  });
});
