import '../../test-setup';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CounterComponent } from './counter.component';
import { isSignal } from '@angular/core';

describe('Angular Signals Academy - Test-Driven Learning 🚀', () => {
  let component: CounterComponent;
  let fixture: ComponentFixture<CounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CounterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('RETO 1: Writable Signals', () => {
    it('debería declarar "counter" como un Writable Signal de Angular inicializado en 0', () => {
      // 1. Verificar que existe la propiedad
      expect(component.counter).toBeDefined();
      
      // 2. Verificar que es una señal de Angular
      const isSignalResult = isSignal(component.counter);
      expect(isSignalResult).withContext(
        '¡Oh no! "counter" debe ser un Signal de Angular. Asegúrate de inicializarlo usando la función: signal(0).'
      ).toBe(true);

      // 3. Verificar que su valor inicial es 0
      expect(component.counter()).withContext(
        'El valor inicial de la señal "counter" debe ser 0.'
      ).toBe(0);
    });
  });

  describe('RETO 2: Signal Inputs (Transformación)', () => {
    it('debería declarar "step" como un Signal Input de Angular con un valor por defecto de 1', () => {
      expect(component.step).toBeDefined();

      const isSignalResult = isSignal(component.step);
      expect(isSignalResult).withContext(
        '¡Buen intento! "step" debe ser un Signal Input moderno de Angular. Usa la función input(1) para declararlo, reemplazando el valor anterior.'
      ).toBe(true);

      expect(component.step()).withContext(
        'El valor por defecto del Signal Input "step" debe ser 1.'
      ).toBe(1);
    });

    it('debería reaccionar correctamente a los cambios en el input dinámicamente', () => {
      // Para Signal Inputs, usamos fixture.componentRef.setInput para cambiar su valor reactivamente
      fixture.componentRef.setInput('step', 5);
      fixture.detectChanges();

      expect(component.step()).withContext(
        'El Signal Input "step" debería haber actualizado su valor a 5 reactivamente.'
      ).toBe(5);
    });
  });

  describe('RETO 3: Computed Signals', () => {
    it('debería declarar "doubleCounter" como un Computed Signal de Angular', () => {
      expect(component.doubleCounter).toBeDefined();

      const isSignalResult = isSignal(component.doubleCounter);
      expect(isSignalResult).withContext(
        '¡Casi lo tienes! "doubleCounter" debe ser un Computed Signal. Inicialízalo usando computed(...).'
      ).toBe(true);
    });

    it('debería retornar el doble del valor de "counter" automáticamente', () => {
      // Si el reto 1 está resuelto, podemos actualizar counter
      if (isSignal(component.counter) && typeof (component.counter as any).set === 'function') {
        (component.counter as any).set(5);
        fixture.detectChanges();
        
        expect(component.doubleCounter()).withContext(
          '¡Atención! "doubleCounter" debería retornar 10 cuando "counter" es 5 (el doble).'
        ).toBe(10);

        (component.counter as any).set(12);
        fixture.detectChanges();

        expect(component.doubleCounter()).withContext(
          '¡Atención! "doubleCounter" debería retornar 24 cuando "counter" es 12.'
        ).toBe(24);
      } else {
        expect.fail('No se puede probar doubleCounter porque "counter" no es un Writable Signal válido aún.');
      }
    });
  });

  describe('RETO 4: Mutación del Estado', () => {
    it('debería incrementar el valor de "counter" sumándole el valor de "step()" al llamar a increment()', () => {
      if (isSignal(component.counter) && typeof (component.counter as any).set === 'function') {
        // Inicializar a 10
        (component.counter as any).set(10);
        fixture.detectChanges();

        // 1. Incrementar con step = 1 (por defecto)
        component.increment();
        fixture.detectChanges();
        expect(component.counter()).withContext(
          'Al llamar a increment() con step = 1, el counter debería pasar de 10 a 11.'
        ).toBe(11);

        // 2. Cambiar step a 5 y volver a incrementar
        fixture.componentRef.setInput('step', 5);
        fixture.detectChanges();

        component.increment();
        fixture.detectChanges();
        expect(component.counter()).withContext(
          'Al llamar a increment() con step = 5, el counter debería pasar de 11 a 16.'
        ).toBe(16);
      } else {
        expect.fail('No se puede probar increment() porque "counter" no es un Writable Signal válido aún.');
      }
    });

    it('debería decrementar el valor de "counter" restándole el valor de "step()" al llamar a decrement()', () => {
      if (isSignal(component.counter) && typeof (component.counter as any).set === 'function') {
        // Inicializar a 20
        (component.counter as any).set(20);
        fixture.detectChanges();

        // 1. Decrementar con step = 1 (por defecto)
        component.decrement();
        fixture.detectChanges();
        expect(component.counter()).withContext(
          'Al llamar a decrement() con step = 1, el counter debería pasar de 20 a 19.'
        ).toBe(19);

        // 2. Cambiar step a 7 y volver a decrementar
        fixture.componentRef.setInput('step', 7);
        fixture.detectChanges();

        component.decrement();
        fixture.detectChanges();
        expect(component.counter()).withContext(
          'Al llamar a decrement() con step = 7, el counter debería pasar de 19 a 12.'
        ).toBe(12);
      } else {
        expect.fail('No se puede probar decrement() porque "counter" no es un Writable Signal válido aún.');
      }
    });
  });
});
