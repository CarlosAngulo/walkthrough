import { Component, OnInit, AfterViewInit, OnDestroy, inject, effect } from '@angular/core';
import { LearningEngineService } from '../services/learning-engine.service';
import { overlaySystem } from '@learning-engine/overlay-system';

@Component({
  template: ''
})
export abstract class LearningComponent implements OnInit, AfterViewInit, OnDestroy {
  private learningEngineService = inject(LearningEngineService);
  private isViewInitialized = false;
  private pendingEvaluations: any[] | null = null;

  constructor() {
    // Reactively update DOM overlays whenever AST rule evaluations change
    effect(() => {
      const evaluations = this.learningEngineService.evaluations();
      console.log('[LearningComponent] Effect triggered, evaluations:', evaluations.length);

      if (evaluations.length === 0) return;

      if (this.isViewInitialized) {
        this.applyOverlays(evaluations);
      } else {
        this.pendingEvaluations = evaluations;
        console.log('[LearningComponent] Storing evaluations until view initializes...');
      }
    });
  }

  private applyOverlays(evaluations: any[]) {
    requestAnimationFrame(() => {
      setTimeout(() => {
        const anchors = document.querySelectorAll('[data-learning-anchor]');
        if (anchors.length > 0) {
          console.log('[LearningComponent] Applying overlays to', anchors.length, 'anchors');
          overlaySystem.update(evaluations);
        } else {
          console.log('[LearningComponent] No anchors found, retrying in 200ms...');
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
    console.log('[LearningComponent] View initialized');

    // If evaluations arrived before DOM was ready, apply them now
    if (this.pendingEvaluations && this.pendingEvaluations.length > 0) {
      console.log('[LearningComponent] Applying pending evaluations from before view init');
      this.applyOverlays(this.pendingEvaluations);
      this.pendingEvaluations = null;
    }
  }

  ngOnDestroy() {
    // Clear active overlays and tooltips when navigating away
    overlaySystem.clear();
  }
}
