import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { LearningComponent } from '../../engine/learning.component';
import { learningStateStore } from '@learning-engine/learning-state';
import { SearchService, Course } from './search.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-rxjs-boundaries',
  standalone: true,
  templateUrl: './rxjs-boundaries.component.html',
  host: {
    class: 'block-rxjs-boundaries'
  }
})
export class RxjsBoundariesComponent extends LearningComponent implements OnInit, OnDestroy {
  // ==========================================
  // Level Configuration and Reward
  // Do not modify this code section as it defines the course progress and achievements logic.
  // ==========================================
  protected override level = 'nivel-5';

  protected onLevelCompleted() {
    learningStateStore.addAchievement(
      'L5_RXJS_INTEROP',
      'RxJS Boundaries Expert 🔄',
      'You crossed the reactivity boundary seamlessly joining Signals and RxJS.',
      '🔄'
    );
    learningStateStore.completeLevel(this.level);
  }
  // ==========================================

  // Inject the mock SearchService
  protected searchService = inject(SearchService);

  // ============================================================================
  // CLASSIC / OUTDATED CODE TO REFACTOR (CHALLENGE 1, 2, 3 and 4)
  // ============================================================================
  // Currently searching works imperatively with RxJS Subjects and
  // manual subscriptions that require releasing memory to avoid memory leaks.
  //
  // Your challenge is to refactor this to Signals following the CodeTour:
  // 1. Convert searchQuery to a Writable Signal: searchQuery = signal<string>('');
  // 2. Convert searchQuery$ to Observable using: toObservable(this.searchQuery)
  // 3. Apply operators in the pipe() pipeline and convert it back to a signal using toSignal().
  // 4. Move the invocation of _setupSearchPipeline to the constructor and remove ngOnInit/ngOnDestroy.
  // ============================================================================

  searchQuery: string = '';
  searchResults: Course[] = [];

  // Subject to emit search terms
  private _searchSubject$ = new Subject<string>();
  
  // Save subscription to unsubscribe in OnDestroy cycle
  private _searchSubscription = new Subscription();

  ngOnInit() {
    super.ngOnInit();
    this.setupSearchPipeline();
  }

  // Method triggered from the UI for each input change
  onSearchInput(value: string) {
    this.searchQuery = value;
    this._searchSubject$.next(value);
  }

  ngOnDestroy() {
    // Mandatory manual memory release in classic RxJS to avoid leaks
    this._searchSubscription.unsubscribe();
  }

  // Initial imperative search setup logic
  private setupSearchPipeline() {
    this._searchSubscription = this._searchSubject$.pipe(
      debounceTime(400), // Wait 400ms after the last event before continuing
      distinctUntilChanged(), // Only emit if the value has changed
      switchMap((query) => this.searchService.search(query)) // Switch to a new search Observable each time the term changes
    ).subscribe((results) => {
      this.searchResults = results; // Imperative state assignment
    });

    // Initial load to show all courses when the component starts
    this._searchSubject$.next('');
  }
}
