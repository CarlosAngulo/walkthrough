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
  // ==========================================
  // Level Configuration and Reward
  // Do not modify this code section as it defines the course progress and achievements logic.
  // ==========================================
  protected override level = 'nivel-1';

  protected onLevelCompleted() {
    learningStateStore.addAchievement(
      'L1_SIGNALS',
      'Writable Signals Master ⚡',
      'Successfully declared writable, input, and computed signals.',
      '⚡'
    );
    learningStateStore.completeLevel(this.level);
  }
  // ==========================================
  // End of level configuration section. The rest of the code is your workspace for this level's challenge.
  // ==========================================

  // ==========================================
  // CHALLENGE 1: Writable Signals
  // ==========================================
  // TODO: Transform this property into a Writable Signal with an initial value of 0.
  // Hint: Replace it with: counter = signal<number>(0);
  counter =  0;

  // ==========================================
  // CHALLENGE 2: Signal Inputs (Transformation)
  // ==========================================
  // TODO: Transform this property into a Signal Input with a default value of 1.
  // Hint: Replace it with: step = input<number>(1);
  step = 1;

  // ==========================================
  // CHALLENGE 3: Computed Signals
  // ==========================================
  // TODO: Transform this property into a Computed Signal that returns double the counter.
  // Hint: Replace it with: doubleCounter = computed(() => this.counter() * 2);
  doubleCounter = 0;

  // ==========================================
  // CHALLENGE 4: Mutating Signals
  // ==========================================
  increment() {
    // Currently works in a traditional way:
    this.counter += this.step;
    this.doubleCounter = this.counter * 2; // Manually recalculated
    
    // TODO: When counter is a signal, update it using the update method:
    // this.counter.update(current => current + this.step());
    // And when doubleCounter is a computed signal, remove the manual recalculation above. It will update itself!
  }

  decrement() {
    // Currently works in a traditional way:
    this.counter -= this.step;
    this.doubleCounter = this.counter * 2; // Manually recalculated

    // TODO: When counter is a signal, update it using the update method:
    // this.counter.update(current => current - this.step());
  }
}
