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
  protected override level = 'nivel-2';

  protected onLevelCompleted() {
    learningStateStore.addAchievement(
      'L2_COMPUTED',
      'Reactive Thinker 🧠',
      'Dominaste las cadenas computadas y el estado derivado reactivo.',
      '🧠'
    );
    learningStateStore.completeLevel('nivel-2');
  }
  // ==========================================
  // RETO 1: Lista de Tareas como Signal
  // ==========================================
  // TODO: Transforma esta propiedad en una Writable Signal que contenga el array de tareas.
  // Pista: Reemplázalo por:
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
  // RETO 2: Filtro Activo como Signal
  // ==========================================
  // TODO: Transforma esta propiedad en una Writable Signal con el valor inicial 'all'.
  // Pista: Reemplázalo por: filter = signal<'all' | 'pending' | 'completed'>('all');
  filter: 'all' | 'pending' | 'completed' = 'all';

  // ==========================================
  // RETO 3: Computed Signal para Tareas Filtradas
  // ==========================================
  // TODO: Transforma filteredTasks en un Computed Signal reactivo.
  // Debe depender de this.tasks() y de this.filter() para filtrar automáticamente las tareas.
  // Pista: Reemplázalo por:
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
  // RETO 4: Computed Signals para Estadísticas (Counts)
  // ==========================================
  // TODO: Transforma pendingCount y completedCount en Computed Signals.
  // - pendingCount debe contar cuántas tareas tienen completed === false.
  // - completedCount debe contar cuántas tareas tienen completed === true.
  // Pistas:
  // pendingCount = computed(() => this.tasks().filter(t => !t.completed).length);
  // completedCount = computed(() => this.tasks().filter(t => t.completed).length);
  pendingCount = 2;
  completedCount = 1;

  // ==========================================
  // RETO 5: Limpieza de Métodos e Inmutabilidad
  // ==========================================
  
  addTask(title: string) {
    if (!title || !title.trim()) return;
    
    // Actualmente funciona mutando directamente el array y recalculando manualmente:
    this.tasks.push({ title: title.trim(), completed: false });
    this.setFilter(this.filter); // Recálculo manual

    // TODO con Signals: Cuando 'tasks' sea una señal, actualízala inmutablemente usando .update()
    // this.tasks.update(list => [...list, { title: title.trim(), completed: false }]);
    // Y elimina por completo la llamada a setFilter(). ¡El computed se actualizará solo!
  }

  toggleTask(index: number) {
    // Actualmente funciona mutando directamente el objeto dentro del array y recalculando:
    this.tasks[index].completed = !this.tasks[index].completed;
    this.setFilter(this.filter); // Recálculo manual

    // TODO con Signals: Cuando 'tasks' sea una señal, actualízala inmutablemente usando .update():
    // this.tasks.update(list =>
    //   list.map((t, i) => i === index ? { ...t, completed: !t.completed } : t)
    // );
    // Y elimina la llamada a setFilter().
  }

  removeTask(index: number) {
    // Actualmente funciona mutando directamente el array con splice:
    this.tasks.splice(index, 1);
    this.setFilter(this.filter); // Recálculo manual

    // TODO con Signals: Cuando 'tasks' sea una señal, actualízala inmutablemente usando .update():
    // this.tasks.update(list => list.filter((_, i) => i !== index));
    // Y elimina la llamada a setFilter().
  }

  setFilter(f: 'all' | 'pending' | 'completed') {
    // Actualmente funciona asignando manualmente las variables y recalculando todo:
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

    // TODO con Signals: Cuando 'filter' sea una señal, simplemente actualízala con .set():
    // this.filter.set(f);
    // ¡Y borra todo el código imperativo de arriba! Las computadas harán el trabajo sucio.
  }
}
