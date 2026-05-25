import { Component, signal, computed, input, effect, inject, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { LearningEngineService } from '../../services/learning-engine.service';
import { overlaySystem } from '@learning-engine/overlay-system';

@Component({
  selector: 'app-counter',
  standalone: true,
  templateUrl: './counter.component.html',
  host: {
    class: 'block-app-counter'
  }
})
export class CounterComponent implements OnInit, AfterViewInit, OnDestroy {
  private learningEngineService = inject(LearningEngineService);
  private isViewInitialized = false;
  private pendingEvaluations: any[] | null = null;

  constructor() {
    // Reactively update DOM overlays whenever AST rule evaluations change
    effect(() => {
      const evaluations = this.learningEngineService.evaluations();
      console.log('[CounterComponent] Effect triggered, evaluations:', evaluations.length);

      if (evaluations.length === 0) return;

      if (this.isViewInitialized) {
        // DOM is ready - apply immediately with a small delay for rendering
        this.applyOverlays(evaluations);
      } else {
        // DOM not ready yet - store for when ngAfterViewInit fires
        this.pendingEvaluations = evaluations;
        console.log('[CounterComponent] Storing evaluations until view initializes...');
      }
    });
  }

  private applyOverlays(evaluations: any[]) {
    // Use requestAnimationFrame to ensure DOM is painted, then apply
    requestAnimationFrame(() => {
      setTimeout(() => {
        const anchors = document.querySelectorAll('[data-learning-anchor]');
        if (anchors.length > 0) {
          console.log('[CounterComponent] Applying overlays to', anchors.length, 'anchors');
          overlaySystem.update(evaluations);
        } else {
          // Anchors not yet in DOM - retry once more after a short delay
          console.log('[CounterComponent] No anchors found, retrying in 200ms...');
          setTimeout(() => {
            overlaySystem.update(evaluations);
          }, 200);
        }
      }, 50);
    });
  }

  ngOnInit() {
    // Force the Vite plugin to trigger a fresh AST evaluation on startup
    this.learningEngineService.triggerRefresh();
  }

  ngAfterViewInit() {
    this.isViewInitialized = true;
    console.log('[CounterComponent] View initialized');

    // If evaluations arrived before DOM was ready, apply them now
    if (this.pendingEvaluations && this.pendingEvaluations.length > 0) {
      console.log('[CounterComponent] Applying pending evaluations from before view init');
      this.applyOverlays(this.pendingEvaluations);
      this.pendingEvaluations = null;
    }
  }

  ngOnDestroy() {
    // Clear active overlays and tooltips when navigating away
    overlaySystem.clear();
  }

  // ==========================================
  // RETO 1: Writable Signals
  // ==========================================
  // TODO: Transforma esta propiedad en una Writable Signal con el valor inicial de 0.
  // Pista: Reemplázalo por: counter = signal<number>(0);
  counter = signal<number>(0);

  // ==========================================
  // RETO 2: Signal Inputs (Transformación)
  // ==========================================
  // TODO: Transforma esta propiedad en un Signal Input con valor por defecto de 1.
  // Pista: Reemplázalo por: step = input<number>(1);
  step = 1;

  // ==========================================
  // RETO 3: Computed Signals
  // ==========================================
  // TODO: Transforma esta propiedad en un Computed Signal que devuelva el doble del counter.
  // Pista: Reemplázalo por: doubleCounter = computed(() => this.counter() * 2);
  doubleCounter = 0;

  // ==========================================
  // RETO 4: Mutación de Señales
  // ==========================================
  increment() {
    // Actualmente funciona de forma tradicional:
    this.counter += this.step;
    this.doubleCounter = this.counter * 2; // Recalculado manualmente
    
    // TODO: Cuando counter sea una señal, actualízala usando el método de actualización:
    // this.counter.update(current => current + this.step());
    // Y cuando doubleCounter sea un computed signal, elimina el recalculo manual de arriba. ¡Se actualizará solo!
  }

  decrement() {
    // Actualmente funciona de forma tradicional:
    this.counter -= this.step;
    this.doubleCounter = this.counter * 2; // Recalculado manualmente

    // TODO: Cuando counter sea una señal, actualízala usando el método de actualización:
    // this.counter.update(current => current - this.step());
  }
}
