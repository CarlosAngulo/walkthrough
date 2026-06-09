import '../../../test-setup';
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TaskFilterComponent } from './task-filter.component';
import { isSignal } from '@angular/core';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Import our custom Vitest matchers to extend expect
import '@learning-engine/test-integration';

describe('Level 2: Reactive Thinking 🧠 - TaskFilterComponent', () => {
  let component: TaskFilterComponent;
  let fixture: ComponentFixture<TaskFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Architectural Structure - AST Semantic Analysis 🧬', () => {
    it('should comply with all reactive design rules and avoid anti-patterns', () => {
      const componentPath = 'src/app/course/level2-state/task-filter.component.ts';
      
      expect(componentPath).toSatisfyRules([
        'L2_TASKS_SIGNAL',
        'L2_FILTER_SIGNAL',
        'L2_FILTERED_TASKS_COMPUTED',
        'L2_PENDING_COUNT_COMPUTED',
        'L2_COMPLETED_COUNT_COMPUTED'
      ]);
    });
  });

  describe('CHALLENGE 1: Task List as a Signal', () => {
    it('should declare "tasks" as an Angular Writable Signal', () => {
      expect(component.tasks).toBeDefined();

      const isSignalResult = isSignal(component.tasks);
      expect(isSignalResult).withContext(
        'Oh no! "tasks" must be an Angular Signal. Make sure to declare and initialize it using the signal() function.'
      ).toBe(true);

      const tasksVal = (component.tasks as any)();
      expect(Array.isArray(tasksVal)).withContext(
        'The value of the "tasks" Signal must be an array.'
      ).toBe(true);

      expect(tasksVal.length).withContext(
        'The initial tasks array must have exactly 3 elements.'
      ).toBe(3);
    });
  });

  describe('CHALLENGE 2: Active Filter as a Signal', () => {
    it('should declare "filter" as an Angular Writable Signal', () => {
      expect(component.filter).toBeDefined();

      const isSignalResult = isSignal(component.filter);
      expect(isSignalResult).withContext(
        'Almost! "filter" must be a mutable signal. Initialize it using signal("all").'
      ).toBe(true);

      expect((component.filter as any)()).withContext(
        'The initial value of "filter" must be "all".'
      ).toBe('all');
    });
  });

  describe('CHALLENGE 3: Computed Signal for Filtered Tasks', () => {
    it('should declare "filteredTasks" as an Angular Computed Signal', () => {
      expect(component.filteredTasks).toBeDefined();

      const isSignalResult = isSignal(component.filteredTasks);
      expect(isSignalResult).withContext(
        'Keep trying! "filteredTasks" must be a Computed Signal. Use it by declaring it with computed(...).'
      ).toBe(true);

      // Computed signals do not have a .set or .update method
      const hasSet = typeof (component.filteredTasks as any).set === 'function';
      expect(hasSet).withContext(
        'Careful! "filteredTasks" must be a READ-ONLY signal (computed), not a mutable Writable Signal.'
      ).toBe(false);
    });

    it('should filter tasks automatically when the filter changes without manual intervention', () => {
      if (isSignal(component.filter) && isSignal(component.tasks)) {
        // Initially filter='all' -> shows 3 tasks
        expect((component.filteredTasks as any)().length).toBe(3);

        // Change filter to completed
        (component.filter as any).set('completed');
        fixture.detectChanges();

        // Should only be 1 completed
        expect((component.filteredTasks as any)().length).withContext(
          'When the filter changes to "completed", filteredTasks() should return only completed tasks (1 task).'
        ).toBe(1);

        // Change filter to pending
        (component.filter as any).set('pending');
        fixture.detectChanges();

        // Should only be 2 pending
        expect((component.filteredTasks as any)().length).withContext(
          'When the filter changes to "pending", filteredTasks() should return only pending tasks (2 tasks).'
        ).toBe(2);
      } else {
        expect.fail('Cannot evaluate reactive filtering because "filter" or "tasks" are not signals yet.');
      }
    });
  });

  describe('CHALLENGE 4: Computed Signals for Statistics (Counts)', () => {
    it('should declare "pendingCount" and "completedCount" as Angular Computed Signals', () => {
      expect(component.pendingCount).toBeDefined();
      expect(component.completedCount).toBeDefined();

      expect(isSignal(component.pendingCount)).withContext(
        '"pendingCount" must be a Computed Signal. Declared with computed(...).'
      ).toBe(true);

      expect(isSignal(component.completedCount)).withContext(
        '"completedCount" must be a Computed Signal. Declared with computed(...).'
      ).toBe(true);

      const hasPendingSet = typeof (component.pendingCount as any).set === 'function';
      expect(hasPendingSet).withContext(
        '"pendingCount" must be a read-only signal (computed).'
      ).toBe(false);

      const hasCompletedSet = typeof (component.completedCount as any).set === 'function';
      expect(hasCompletedSet).withContext(
        '"completedCount" must be a read-only signal (computed).'
      ).toBe(false);
    });

    it('should update counts automatically when the task list changes', () => {
      if (isSignal(component.tasks) && typeof (component.tasks as any).update === 'function') {
        expect((component.pendingCount as any)()).toBe(2);
        expect((component.completedCount as any)()).toBe(1);

        // Toggle the second task (index 1: "Dominar Computed...") to complete it
        (component.tasks as any).update((list: any[]) => 
          list.map((t, i) => i === 1 ? { ...t, completed: true } : t)
        );
        fixture.detectChanges();

        expect((component.pendingCount as any)()).withContext(
          'When completing the second task, pendingCount() should automatically drop to 1.'
        ).toBe(1);
        expect((component.completedCount as any)()).withContext(
          'When completing the second task, completedCount() should automatically rise to 2.'
        ).toBe(2);
      } else {
        expect.fail('Cannot evaluate reactive statistics because "tasks" is not a Writable Signal.');
      }
    });
  });

  describe('CHALLENGE 5: State Mutation and Immutability', () => {
    it('should add a new task immutably and see changes reflected throughout the system', () => {
      if (isSignal(component.tasks) && isSignal(component.filteredTasks) && isSignal(component.pendingCount)) {
        const initialLength = (component.tasks as any)().length;
        
        component.addTask('Probar inmutabilidad con Vitest 🚀');
        fixture.detectChanges();

        expect((component.tasks as any)().length).toBe(initialLength + 1);
        expect((component.tasks as any)()[initialLength].title).toBe('Probar inmutabilidad con Vitest 🚀');
        expect((component.tasks as any)()[initialLength].completed).toBe(false);
        
        // Pending count should increase
        expect((component.pendingCount as any)()).toBe(3);
      } else {
        expect.fail('Cannot test addTask because dependencies are not signals yet.');
      }
    });

    it('should toggle the completed state of a task immutably', () => {
      if (isSignal(component.tasks) && isSignal(component.completedCount)) {
        // Task at index 0 ("Aprender Signals Básicos ⚡") is completed: true initially
        expect((component.tasks as any)()[0].completed).toBe(true);
        expect((component.completedCount as any)()).toBe(1);

        component.toggleTask(0);
        fixture.detectChanges();

        expect((component.tasks as any)()[0].completed).withContext(
          'toggleTask(0) should switch the state from true to false.'
        ).toBe(false);
        expect((component.completedCount as any)()).withContext(
          'completedCount() should drop to 0.'
        ).toBe(0);
      } else {
        expect.fail('Cannot test toggleTask because dependencies are not signals.');
      }
    });

    it('should remove a task immutably', () => {
      if (isSignal(component.tasks) && isSignal(component.filteredTasks)) {
        expect((component.tasks as any)().length).toBe(3);

        component.removeTask(1); // Removes "Dominar Computed..."
        fixture.detectChanges();

        expect((component.tasks as any)().length).toBe(2);
        expect((component.tasks as any)()[1].title).toBe('Explorar Arquitectura de Effects 💾'); // Now index 1
      } else {
        expect.fail('Cannot test removeTask because dependencies are not signals.');
      }
    });
  });

  describe('Architectural Analysis (Reactive Disciplines) 🧐', () => {
    it('should not contain manual runtime assignments to computed variables', () => {
      const filePath = resolve(__dirname, 'task-filter.component.ts');
      const code = readFileSync(filePath, 'utf-8');

      // Search for filteredTasks reassignments in methods (outside class declaration)
      const filteredTasksMatches = code.match(/this\.filteredTasks\s*=/g) || [];
      expect(filteredTasksMatches.length).withContext(
        'Architectural Alert! "filteredTasks" must only be assigned once in its declaration using computed(). You must not perform manual assignments of the type "this.filteredTasks = ..." in your methods.'
      ).toBe(0);

      // Search for pendingCount reassignments
      const pendingCountMatches = code.match(/this\.pendingCount\s*=/g) || [];
      expect(pendingCountMatches.length).withContext(
        'Architectural Alert! "pendingCount" must only be declared once using computed(). You must not assign values to it manually.'
      ).toBe(0);

      // Search for completedCount reassignments
      const completedCountMatches = code.match(/this\.completedCount\s*=/g) || [];
      expect(completedCountMatches.length).withContext(
        'Architectural Alert! "completedCount" must only be declared once using computed(). You must not assign values to it manually.'
      ).toBe(0);
    });

    it('should not call setFilter or perform imperative recalculations in mutation methods', () => {
      const filePath = resolve(__dirname, 'task-filter.component.ts');
      const code = readFileSync(filePath, 'utf-8');

      // If the student migrated correctly, they will not call "this.setFilter" in their manipulation methods.
      const thisSetFilterMatches = code.match(/this\.setFilter/g) || [];
      expect(thisSetFilterMatches.length).withContext(
        'Architectural Alert! You must not call "this.setFilter()" in addTask(), toggleTask(), or removeTask(). When using computed(), the derived state is automatically recalculated when source signals change.'
      ).toBe(0);
    });
  });
});
