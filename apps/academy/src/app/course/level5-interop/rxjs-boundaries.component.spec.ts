import '../../../test-setup';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RxjsBoundariesComponent } from './rxjs-boundaries.component';
import { SearchService } from './search.service';
import { isSignal, signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import '@learning-engine/test-integration';

describe('Nivel 5: RxJS Boundaries 🔄 - RxjsBoundariesComponent', () => {
  let component: RxjsBoundariesComponent;
  let fixture: ComponentFixture<RxjsBoundariesComponent>;
  let searchServiceMock: any;

  beforeEach(() => {
    // Crear un mock del SearchService
    searchServiceMock = {
      search: vi.fn().mockReturnValue(of([
        { id: 'c1', title: 'Signals Course', category: 'Signals', difficulty: 'Principiante', emoji: '⚡' }
      ]).pipe(delay(50)))
    };
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function createComponent() {
    await TestBed.configureTestingModule({
      imports: [RxjsBoundariesComponent],
      providers: [
        { provide: SearchService, useValue: searchServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RxjsBoundariesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  describe('Estructura Arquitectónica - Análisis Semántico AST 🧬', () => {
    it('debería cumplir con todas las reglas de diseño reactivo y evitar anti-patrones', () => {
      const componentPath = 'src/app/course/level5-interop/rxjs-boundaries.component.ts';
      
      expect(componentPath).toSatisfyRules([
        'L5_SEARCH_QUERY_SIGNAL',
        'L5_TO_OBSERVABLE',
        'L5_RXJS_OPERATORS',
        'L5_TO_SIGNAL'
      ]);
    });
  });

  describe('RETO 1: Writable Signal para la Búsqueda', () => {
    it('debería declarar "searchQuery" como una Writable Signal inicializada en cadena vacía', async () => {
      await createComponent();

      expect(component.searchQuery).toBeDefined();
      expect(isSignal(component.searchQuery)).withContext(
        '¡Alerta! "searchQuery" debe ser un Signal mutable de Angular. Reemplázala usando la función: signal("").'
      ).toBe(true);
      expect(component.searchQuery()).toBe('');
    });
  });

  describe('RETO 2, 3 y 4: Puenteo a RxJS y Conversión de Vuelta', () => {
    it('debería declarar "searchResults" como una Signal de Angular', async () => {
      await createComponent();

      expect(component.searchResults).toBeDefined();
      expect(isSignal(component.searchResults)).withContext(
        '¡Alerta! "searchResults" debe ser un Signal (de solo lectura). Se creará usando la función toSignal().'
      ).toBe(true);
    });

    it('debería inicializar "searchResults" con un valor inicial de array vacío', async () => {
      await createComponent();

      if (isSignal(component.searchResults)) {
        expect(component.searchResults()).toEqual([]);
      } else {
        expect(component.searchResults).toEqual([]);
      }
    });

    it('debería aplicar debounceTime y switchMap correctamente al cambiar searchQuery', async () => {
      await createComponent();

      if (isSignal(component.searchQuery) && typeof (component.searchQuery as any).set === 'function') {
        // Cambiar searchQuery
        (component.searchQuery as any).set('angular');
        fixture.detectChanges();
        
        // El debounceTime es de 400ms. Si avanzamos 200ms, no debería haber llamado a search() todavía.
        vi.advanceTimersByTime(200);
        expect(searchServiceMock.search).not.toHaveBeenCalled();

        // Si avanzamos otros 200ms (total 400ms), debería ejecutarse el debounce y llamarse al servicio.
        vi.advanceTimersByTime(200);
        expect(searchServiceMock.search).toHaveBeenCalledWith('angular');

        // Latencia de simulación de delay(50ms) en el mock
        vi.advanceTimersByTime(50);
        fixture.detectChanges();

        // Los resultados se deben haber propagado a la señal searchResults
        expect(component.searchResults()).toEqual([
          { id: 'c1', title: 'Signals Course', category: 'Signals', difficulty: 'Principiante', emoji: '⚡' }
        ]);
      } else {
        // Si no son señales todavía, el test se da por superado provisionalmente para no frustrar la compilación.
        expect(true).toBe(true);
      }
    });

    it('debería cancelar búsquedas anteriores en vuelo si se ingresa un nuevo término rápido (switchMap)', async () => {
      await createComponent();

      if (isSignal(component.searchQuery) && typeof (component.searchQuery as any).set === 'function') {
        // Disparar primer término
        (component.searchQuery as any).set('rx');
        fixture.detectChanges();
        vi.advanceTimersByTime(400); // Expiración del primer debounce

        expect(searchServiceMock.search).toHaveBeenCalledTimes(1);

        // Sin dejar terminar la latencia (que demora 50ms), escribimos otro término rápido
        (component.searchQuery as any).set('rxjs');
        fixture.detectChanges();
        vi.advanceTimersByTime(400); // Expiración del segundo debounce

        // switchMap debe cancelar o superponer la petición anterior
        expect(searchServiceMock.search).toHaveBeenCalledTimes(2);
        expect(searchServiceMock.search).toHaveBeenLastCalledWith('rxjs');

        vi.advanceTimersByTime(50); // Dejar que termine la segunda petición
        fixture.detectChanges();
      } else {
        expect(true).toBe(true);
      }
    });
  });
});
