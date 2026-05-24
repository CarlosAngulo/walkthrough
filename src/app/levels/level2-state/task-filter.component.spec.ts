import '../../../test-setup';
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TaskFilterComponent } from './task-filter.component';
import { isSignal } from '@angular/core';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Nivel 2: Reactive Thinking 🧠 - TaskFilterComponent', () => {
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

  describe('RETO 1: Lista de Tareas como Signal', () => {
    it('debería declarar "tasks" como un Writable Signal de Angular', () => {
      expect(component.tasks).toBeDefined();

      const isSignalResult = isSignal(component.tasks);
      expect(isSignalResult).withContext(
        '¡Oh no! "tasks" debe ser un Signal de Angular. Asegúrate de declararla e inicializarla usando la función signal().'
      ).toBe(true);

      const tasksVal = (component.tasks as any)();
      expect(Array.isArray(tasksVal)).withContext(
        'El valor del Signal "tasks" debe ser un array.'
      ).toBe(true);

      expect(tasksVal.length).withContext(
        'El array de tareas inicial debe tener exactamente 3 elementos.'
      ).toBe(3);
    });
  });

  describe('RETO 2: Filtro Activo como Signal', () => {
    it('debería declarar "filter" como un Writable Signal de Angular', () => {
      expect(component.filter).toBeDefined();

      const isSignalResult = isSignal(component.filter);
      expect(isSignalResult).withContext(
        '¡Casi! "filter" debe ser una señal mutable. Inicialízala usando signal("all").'
      ).toBe(true);

      expect((component.filter as any)()).withContext(
        'El valor inicial de "filter" debe ser "all".'
      ).toBe('all');
    });
  });

  describe('RETO 3: Computed Signal para Tareas Filtradas', () => {
    it('debería declarar "filteredTasks" como un Computed Signal de Angular', () => {
      expect(component.filteredTasks).toBeDefined();

      const isSignalResult = isSignal(component.filteredTasks);
      expect(isSignalResult).withContext(
        '¡Sigue intentando! "filteredTasks" debe ser un Computed Signal. Úsalo declarándolo con computed(...).'
      ).toBe(true);

      // Los computed signals no tienen el método .set o .update
      const hasSet = typeof (component.filteredTasks as any).set === 'function';
      expect(hasSet).withContext(
        '¡Cuidado! "filteredTasks" debe ser una señal de LECTURA (computed), no una Writable Signal mutable.'
      ).toBe(false);
    });

    it('debería filtrar las tareas automáticamente al cambiar el filtro sin intervención manual', () => {
      if (isSignal(component.filter) && isSignal(component.tasks)) {
        // Inicialmente filter='all' -> muestra 3 tareas
        expect((component.filteredTasks as any)().length).toBe(3);

        // Cambiar el filtro a completed
        (component.filter as any).set('completed');
        fixture.detectChanges();

        // Debería quedar solo 1 completada
        expect((component.filteredTasks as any)().length).withContext(
          'Cuando el filtro cambia a "completed", filteredTasks() debería retornar solo las tareas completadas (1 tarea).'
        ).toBe(1);

        // Cambiar el filtro a pending
        (component.filter as any).set('pending');
        fixture.detectChanges();

        // Deberían quedar 2 pendientes
        expect((component.filteredTasks as any)().length).withContext(
          'Cuando el filtro cambia a "pending", filteredTasks() debería retornar solo las tareas pendientes (2 tareas).'
        ).toBe(2);
      } else {
        expect.fail('No se puede evaluar el filtrado reactivo porque "filter" o "tasks" no son señales aún.');
      }
    });
  });

  describe('RETO 4: Computed Signals para Estadísticas (Counts)', () => {
    it('debería declarar "pendingCount" y "completedCount" como Computed Signals de Angular', () => {
      expect(component.pendingCount).toBeDefined();
      expect(component.completedCount).toBeDefined();

      expect(isSignal(component.pendingCount)).withContext(
        '\"pendingCount\" debe ser un Computed Signal. Declarado con computed(...).'
      ).toBe(true);

      expect(isSignal(component.completedCount)).withContext(
        '\"completedCount\" debe ser un Computed Signal. Declarado con computed(...).'
      ).toBe(true);

      const hasPendingSet = typeof (component.pendingCount as any).set === 'function';
      expect(hasPendingSet).withContext(
        '\"pendingCount\" debe ser una señal de lectura (computed).'
      ).toBe(false);

      const hasCompletedSet = typeof (component.completedCount as any).set === 'function';
      expect(hasCompletedSet).withContext(
        '\"completedCount\" debe ser una señal de lectura (computed).'
      ).toBe(false);
    });

    it('debería actualizar los conteos automáticamente cuando cambia la lista de tareas', () => {
      if (isSignal(component.tasks) && typeof (component.tasks as any).update === 'function') {
        expect((component.pendingCount as any)()).toBe(2);
        expect((component.completedCount as any)()).toBe(1);

        // Toggle de la segunda tarea (índice 1: "Dominar Computed...") para completarla
        (component.tasks as any).update((list: any[]) => 
          list.map((t, i) => i === 1 ? { ...t, completed: true } : t)
        );
        fixture.detectChanges();

        expect((component.pendingCount as any)()).withContext(
          'Al completar la segunda tarea, pendingCount() debería bajar automáticamente a 1.'
        ).toBe(1);
        expect((component.completedCount as any)()).withContext(
          'Al completar la segunda tarea, completedCount() debería subir automáticamente a 2.'
        ).toBe(2);
      } else {
        expect.fail('No se pueden evaluar las estadísticas reactivas porque "tasks" no es un Writable Signal.');
      }
    });
  });

  describe('RETO 5: Mutación de Estado e Inmutabilidad', () => {
    it('debería agregar una nueva tarea inmutablemente y ver reflejados los cambios en todo el sistema', () => {
      if (isSignal(component.tasks) && isSignal(component.filteredTasks) && isSignal(component.pendingCount)) {
        const initialLength = (component.tasks as any)().length;
        
        component.addTask('Probar inmutabilidad con Vitest 🚀');
        fixture.detectChanges();

        expect((component.tasks as any)().length).toBe(initialLength + 1);
        expect((component.tasks as any)()[initialLength].title).toBe('Probar inmutabilidad con Vitest 🚀');
        expect((component.tasks as any)()[initialLength].completed).toBe(false);
        
        // El conteo de pendientes debería subir
        expect((component.pendingCount as any)()).toBe(3);
      } else {
        expect.fail('No se puede probar addTask porque las dependencias no son señales aún.');
      }
    });

    it('debería conmutar (toggle) el estado completado de una tarea inmutablemente', () => {
      if (isSignal(component.tasks) && isSignal(component.completedCount)) {
        // Tarea en índice 0 ("Aprender Signals Básicos ⚡") está completed: true inicialmente
        expect((component.tasks as any)()[0].completed).toBe(true);
        expect((component.completedCount as any)()).toBe(1);

        component.toggleTask(0);
        fixture.detectChanges();

        expect((component.tasks as any)()[0].completed).withContext(
          'toggleTask(0) debería cambiar el estado de true a false.'
        ).toBe(false);
        expect((component.completedCount as any)()).withContext(
          'completedCount() debería bajar a 0.'
        ).toBe(0);
      } else {
        expect.fail('No se puede probar toggleTask porque las dependencias no son señales.');
      }
    });

    it('debería eliminar una tarea inmutablemente', () => {
      if (isSignal(component.tasks) && isSignal(component.filteredTasks)) {
        expect((component.tasks as any)().length).toBe(3);

        component.removeTask(1); // Elimina "Dominar Computed..."
        fixture.detectChanges();

        expect((component.tasks as any)().length).toBe(2);
        expect((component.tasks as any)()[1].title).toBe('Explorar Arquitectura de Effects 💾'); // Ahora es el índice 1
      } else {
        expect.fail('No se puede probar removeTask porque las dependencias no son señales.');
      }
    });
  });

  describe('Análisis Arquitectónico (Disciplinas Reactivas) 🧐', () => {
    it('no debería contener asignaciones manuales en runtime a variables computadas', () => {
      const filePath = resolve(__dirname, 'task-filter.component.ts');
      const code = readFileSync(filePath, 'utf-8');

      // Buscar reasignaciones de filteredTasks en métodos (fuera de la declaración de la clase)
      // En la versión final, solo debe aparecer la declaración: "filteredTasks = computed(...)"
      // Buscamos cuántas veces aparece "filteredTasks =" o "filteredTasks=" en todo el archivo.
      const filteredTasksMatches = code.match(/filteredTasks\s*=/g) || [];
      expect(filteredTasksMatches.length).withContext(
        '¡Alerta de Arquitectura! "filteredTasks" solo debe ser asignada una vez en su declaración usando computed(). No debes realizar asignaciones manuales del tipo "this.filteredTasks = ..." en tus métodos.'
      ).toBeLessThanOrEqual(1);

      // Buscar reasignaciones de pendingCount
      const pendingCountMatches = code.match(/pendingCount\s*=/g) || [];
      expect(pendingCountMatches.length).withContext(
        '¡Alerta de Arquitectura! "pendingCount" solo debe ser declarada una vez usando computed(). No debes asignarle valores manualmente.'
      ).toBeLessThanOrEqual(1);

      // Buscar reasignaciones de completedCount
      const completedCountMatches = code.match(/completedCount\s*=/g) || [];
      expect(completedCountMatches.length).withContext(
        '¡Alerta de Arquitectura! "completedCount" solo debe ser declarada una vez usando computed(). No debes asignarle valores manualmente.'
      ).toBeLessThanOrEqual(1);
    });

    it('no debería llamar a setFilter ni realizar recálculos imperativos en los métodos de mutación', () => {
      const filePath = resolve(__dirname, 'task-filter.component.ts');
      const code = readFileSync(filePath, 'utf-8');

      // Si el estudiante migró correctamente, no llamará a "this.setFilter" en sus métodos de manipulación.
      // Solo mantendrá la declaración del método "setFilter(f: ...)" y quizás "this.filter.set(f)".
      // Por ende, la cadena "this.setFilter" (con el "this.") no debe aparecer para nada en el archivo.
      const thisSetFilterMatches = code.match(/this\.setFilter/g) || [];
      expect(thisSetFilterMatches.length).withContext(
        '¡Alerta de Arquitectura! No debes llamar a "this.setFilter()" en addTask(), toggleTask() ni removeTask(). Al usar computed(), el estado derivado se recalcula automáticamente cuando cambian las señales de origen.'
      ).toBe(0);
    });
  });
});
