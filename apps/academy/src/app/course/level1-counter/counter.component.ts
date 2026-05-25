import { Component, signal, computed, input, effect } from '@angular/core';
import { LearningComponent } from '../../engine/learning.component';
import { learningStateStore } from '@learning-engine/learning-state';

@Component({
  selector: 'app-counter',
  standalone: true,
  templateUrl: './counter.component.html',
  host: {
    class: 'block-app-counter'
  }
})
export class CounterComponent extends LearningComponent {
  protected override level = 'nivel-1';

  constructor() {
    super();
    // Reactively unlock achievements and levels when the service signals validation success!
    effect(() => {
      const isValid = this.learningEngineService.isValid();
      if (isValid) {
        learningStateStore.addAchievement(
          'L1_SIGNALS',
          'Writable Signals Master ⚡',
          'Declaraste con éxito writable, input y computed signals.',
          '⚡'
        );
        learningStateStore.completeLevel('nivel-1');
      }
    });
  }
  // ==========================================
  // RETO 1: Writable Signals
  // ==========================================
  // TODO: Transforma esta propiedad en una Writable Signal con el valor inicial de 0.
  // Pista: Reemplázalo por: counter = signal<number>(0);
  counter =  signal<number>(0);

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
