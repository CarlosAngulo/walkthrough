import { Injectable, signal } from '@angular/core';
import { RuleEvaluation } from '@learning-engine/overlay-system';

@Injectable({
  providedIn: 'root'
})
export class LearningEngineService {
  evaluations = signal<RuleEvaluation[]>([]);
  isValid = signal<boolean>(false);

  /** Tracks whether we have successfully received data at least once */
  private hasReceivedData = false;

  constructor() {
    // 1. Dev Live Updates: Connect to Vite's Hot WebSocket for real-time HMR events (dev-only)
    if (typeof window !== 'undefined' && (import.meta as any).hot) {
      console.log('[Learning Engine] Setting up WebSocket listener for live updates...');
      const hot = (import.meta as any).hot;
      hot.on('learning-engine:status', (data: any) => {
        console.log('[Learning Engine] WebSocket status push received:', data);
        this.applyEvaluations(data);
      });
    }

    // 2. Initial Load: Fetch from the HTTP API with retry logic
    this.fetchStatusWithRetry(3, 1000);
  }

  private applyEvaluations(data: any) {
    const evals = data?.evaluations || [];
    const valid = data?.isValid || false;
    this.evaluations.set(evals);
    this.isValid.set(valid);
    this.hasReceivedData = evals.length > 0;
    console.log('[Learning Engine] Evaluations applied:', evals.length, 'rules, isValid:', valid);
  }

  /**
   * Fetch status from the HTTP API with automatic retry on failure.
   * The Vite dev server middleware may not be ready immediately after a page refresh.
   */
  private fetchStatusWithRetry(retriesLeft: number, delayMs: number) {
    // Environment Guard: Skip in SSR/test contexts
    if (typeof window === 'undefined' || (typeof process !== 'undefined' && process.env?.['VITEST'])) {
      return;
    }

    fetch('/api/learning-engine/status')
      .then(response => {
        if (!response.ok) throw new Error(`HTTP Status Error: ${response.status}`);
        return response.json();
      })
      .then(data => {
        console.log('[Learning Engine] HTTP status fetch success:', data);
        this.applyEvaluations(data);
      })
      .catch(err => {
        console.warn(`[Learning Engine] HTTP fetch failed (retries left: ${retriesLeft}):`, err.message);
        if (retriesLeft > 0) {
          setTimeout(() => {
            this.fetchStatusWithRetry(retriesLeft - 1, delayMs * 1.5);
          }, delayMs);
        }
      });
  }

  triggerRefresh() {
    // Fetch from HTTP API
    this.fetchStatusWithRetry(2, 500);
    
    // Also send a WebSocket ping if available
    if (typeof window !== 'undefined' && (import.meta as any).hot) {
      (import.meta as any).hot.send('learning-engine:ping');
    }
  }
}
