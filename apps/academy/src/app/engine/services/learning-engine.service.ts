import { Injectable, signal, NgZone, inject } from '@angular/core';
import { RuleEvaluation } from '@learning-engine/overlay-system';

export interface TestTaskResult {
  name: string;
  status: 'pass' | 'fail' | 'pending';
  error: string | null;
}

export interface TestFileResult {
  filepath: string;
  name: string;
  tasks: TestTaskResult[];
}

@Injectable({
  providedIn: 'root'
})
export class LearningEngineService {
  private ngZone = inject(NgZone);

  evaluations = signal<RuleEvaluation[]>([]);
  isValid = signal<boolean>(false);
  activeLevel = signal<string>('nivel-1');
  
  /** Structure list of Vitest unit test results streamed in real-time */
  testResults = signal<TestFileResult[]>([]);

  constructor() {
    // 1. Dev Live Updates: Connect to Vite's Hot WebSocket for real-time HMR events (dev-only)
    if (typeof window !== 'undefined' && (import.meta as any).hot) {
      const hot = (import.meta as any).hot;
      
      // Listen to AST analysis rules evaluation status
      hot.on('learning-engine:status', (data: any) => {
        this.applyEvaluations(data);
      });

      // Listen to Vitest unit test results streamed from our custom reporter
      hot.on('learning-engine:test-results', (data: TestFileResult[]) => {
        console.log('[Learning Engine] WebSocket test results push received:', data);
        this.ngZone.run(() => {
          this.testResults.set(data || []);
        });
      });
    }

    // 2. Initial Load: Fetch status and test results from the HTTP API with retry logic
    this.fetchStatusWithRetry('nivel-1', 3, 1000);
    this.fetchTestResultsWithRetry(3, 1000);
  }

  private applyEvaluations(data: any) {
    this.ngZone.run(() => {
      const evals = data?.evaluations || [];
      const valid = data?.isValid || false;
      this.evaluations.set(evals);
      this.isValid.set(valid);
    });
  }

  /**
   * Fetch AST rules status with automatic retry on failure
   */
  private fetchStatusWithRetry(level: string, retriesLeft: number, delayMs: number) {
    if (typeof window === 'undefined' || (typeof process !== 'undefined' && process.env?.['VITEST'])) {
      return;
    }

    fetch(`/api/learning-engine/status?level=${level}`)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP Status Error: ${response.status}`);
        return response.json();
      })
      .then(data => {
        this.applyEvaluations(data);
      })
      .catch(err => {
        if (retriesLeft > 0) {
          setTimeout(() => {
            this.fetchStatusWithRetry(level, retriesLeft - 1, delayMs * 1.5);
          }, delayMs);
        }
      });
  }

  /**
   * Fetch Vitest unit test results with automatic retry on failure
   */
  private fetchTestResultsWithRetry(retriesLeft: number, delayMs: number) {
    if (typeof window === 'undefined' || (typeof process !== 'undefined' && process.env?.['VITEST'])) {
      return;
    }

    fetch('/api/learning-engine/test-results')
      .then(response => {
        if (!response.ok) throw new Error(`HTTP Status Error: ${response.status}`);
        return response.json();
      })
      .then((data: TestFileResult[]) => {
        // console.log('[Learning Engine] HTTP test results fetch success:', data);
        this.testResults.set(data || []);
      })
      .catch(err => {
        if (retriesLeft > 0) {
          setTimeout(() => {
            this.fetchTestResultsWithRetry(retriesLeft - 1, delayMs * 1.5);
          }, delayMs);
        }
      });
  }

  triggerRefresh(level: string = this.activeLevel()) {
    // Reset AST validation and evaluations state to prevent cross-level state leak
    this.isValid.set(false);
    this.evaluations.set([]);

    this.activeLevel.set(level);
    this.fetchStatusWithRetry(level, 2, 500);
    this.fetchTestResultsWithRetry(2, 500);
    
    if (typeof window !== 'undefined' && (import.meta as any).hot) {
      (import.meta as any).hot.send('learning-engine:ping', { level });
    }
  }
}
