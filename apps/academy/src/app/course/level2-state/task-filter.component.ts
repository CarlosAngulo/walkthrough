import { Component, signal, computed, effect } from '@angular/core';
import { LearningComponent } from '../../engine/learning.component';
import { learningStateStore } from '@learning-engine/learning-state';

export interface Task {
  title: string;
  completed: boolean;
}

@Component({
  selector: 'app-task-filter',
  standalone: true,
  templateUrl: './task-filter.component.html',
  host: {
    class: 'block-task-filter'
  }
})
export class TaskFilterComponent extends LearningComponent {
  // ==========================================
  // Level Configuration and Reward
  // Do not modify this code section as it defines the course progress and achievements logic.
  // ==========================================
  protected override level = 'nivel-2';

  protected onLevelCompleted() {
    learningStateStore.addAchievement(
      'L2_COMPUTED',
      'Reactive Thinker 🧠',
      'You mastered computed chains and reactive derived state.',
      '🧠'
    );
    learningStateStore.completeLevel(this.level);
  }
  // ==========================================
  // End of level configuration section. The rest of the code is your workspace for this level's challenge.
  // ==========================================
  
  // ==========================================
  // CHALLENGE 1: Task List as a Signal
  // ==========================================
  // TODO: Transform this property into a Writable Signal containing the tasks array.
  // Hint: Replace it with:
  // tasks = signal<Task[]>([
  //   { title: 'Aprender Signals Básicos ⚡', completed: true },
  //   { title: 'Dominar Computed & Derived State 🧠', completed: false },
  //   { title: 'Explorar Arquitectura de Effects 💾', completed: false }
  // ]);
  tasks: Task[] = [
    { title: 'Aprender Signals Básicos ⚡', completed: true },
    { title: 'Dominar Computed & Derived State 🧠', completed: false },
    { title: 'Explorar Arquitectura de Effects 💾', completed: false }
  ];

  // ==========================================
  // CHALLENGE 2: Active Filter as a Signal
  // ==========================================
  // TODO: Transform this property into a Writable Signal with initial value 'all'.
  // Hint: Replace it with: filter = signal<'all' | 'pending' | 'completed'>('all');
  filter: 'all' | 'pending' | 'completed' = 'all';

  // ==========================================
  // CHALLENGE 3: Computed Signal for Filtered Tasks
  // ==========================================
  // TODO: Transform filteredTasks into a reactive Computed Signal.
  // It must depend on this.tasks() and this.filter() to automatically filter tasks.
  // Hint: Replace it with:
  // filteredTasks = computed(() => {
  //   const currentFilter = this.filter();
  //   const allTasks = this.tasks();
  //   if (currentFilter === 'all') return allTasks;
  //   return allTasks.filter(t => currentFilter === 'completed' ? t.completed : !t.completed);
  // });
  filteredTasks: Task[] = [
    { title: 'Aprender Signals Básicos ⚡', completed: true },
    { title: 'Dominar Computed & Derived State 🧠', completed: false },
    { title: 'Explorar Arquitectura de Effects 💾', completed: false }
  ];

  // ==========================================
  // CHALLENGE 4: Computed Signals for Statistics (Counts)
  // ==========================================
  // TODO: Transform pendingCount and completedCount into Computed Signals.
  // - pendingCount must count how many tasks have completed === false.
  // - completedCount must count how many tasks have completed === true.
  // Hints:
  // pendingCount = computed(() => this.tasks().filter(t => !t.completed).length);
  // completedCount = computed(() => this.tasks().filter(t => t.completed).length);
  pendingCount = 2;
  completedCount = 1;

  // ==========================================
  // CHALLENGE 5: Method Clean Up and Immutability
  // ==========================================
  
  addTask(title: string) {
    if (!title || !title.trim()) return;
    
    // Currently works by directly mutating the array and manually recalculating:
    this.tasks.push({ title: title.trim(), completed: false });
    this.setFilter(this.filter); // Manual recalculation

    // TODO with Signals: When 'tasks' is a signal, update it immutably using .update()
    // this.tasks.update(list => [...list, { title: title.trim(), completed: false }]);
    // And completely remove the call to setFilter(). The computed signal will update itself!
  }

  toggleTask(index: number) {
    // Currently works by directly mutating the object inside the array and recalculating:
    this.tasks[index].completed = !this.tasks[index].completed;
    this.setFilter(this.filter); // Manual recalculation

    // TODO with Signals: When 'tasks' is a signal, update it immutably using .update():
    // this.tasks.update(list =>
    //   list.map((t, i) => i === index ? { ...t, completed: !t.completed } : t)
    // );
    // And remove the call to setFilter().
  }

  removeTask(index: number) {
    // Currently works by directly mutating the array with splice:
    this.tasks.splice(index, 1);
    this.setFilter(this.filter); // Manual recalculation

    // TODO with Signals: When 'tasks' is a signal, update it immutably using .update():
    // this.tasks.update(list => list.filter((_, i) => i !== index));
    // And remove the call to setFilter().
  }

  setFilter(f: 'all' | 'pending' | 'completed') {
    // Currently works by manually assigning variables and recalculating everything:
    this.filter = f;
    
    if (this.filter === 'all') {
      this.filteredTasks = [...this.tasks];
    } else if (this.filter === 'completed') {
      this.filteredTasks = this.tasks.filter(t => t.completed);
    } else {
      this.filteredTasks = this.tasks.filter(t => !t.completed);
    }

    this.pendingCount = this.tasks.filter(t => !t.completed).length;
    this.completedCount = this.tasks.filter(t => t.completed).length;

    // TODO with Signals: When 'filter' is a signal, simply update it using .set():
    // this.filter.set(f);
    // And delete all the imperative code above! Computed properties will do the work.
  }
}
