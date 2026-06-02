import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { LearningComponent } from '../../engine/learning.component';
import { learningStateStore } from '@learning-engine/learning-state';
import { SearchService, Course } from './search.service';

// Nota para el estudiante: para poder usar toObservable y toSignal,
// necesitarás importar estas funciones utilitarias desde el sub-módulo rxjs-interop:
// import { toSignal, toObservable } from '@angular/core/rxjs-interop';
// import { signal } from '@angular/core';

@Component({
  selector: 'app-rxjs-boundaries',
  standalone: true,
  templateUrl: './rxjs-boundaries.component.html',
  host: {
    class: 'block-rxjs-boundaries'
  }
})
export class RxjsBoundariesComponent extends LearningComponent implements OnInit, OnDestroy {
  // ==========================================
  // Configuración del Nivel y Recompensa
  // No modifiques esta sección de código ya que define la lógica de progreso y logros del curso.
  // ==========================================
  protected override level = 'nivel-5';

  protected onLevelCompleted() {
    learningStateStore.addAchievement(
      'L5_RXJS_INTEROP',
      'RxJS Boundaries Expert 🔄',
      'Cruzaste la frontera de reactividad uniendo de forma perfecta Signals y RxJS.',
      '🔄'
    );
    learningStateStore.completeLevel(this.level);
  }
  // ==========================================

  // Inyectar el mock SearchService
  protected searchService = inject(SearchService);

  // ============================================================================
  // CÓDIGO CLÁSICO / ANTICUADO A REFACTORIZAR (RETO 1, 2, 3 y 4)
  // ============================================================================
  // Actualmente la búsqueda funciona de forma imperativa con Subjects de RxJS y
  // suscripciones manuales que requieren liberar memoria para evitar fugas (memory leaks).
  //
  // Tu reto consiste en refactorizar esto a Signals siguiendo el CodeTour:
  // 1. Convierte searchQuery en una Writable Signal: searchQuery = signal<string>('');
  // 2. Convierte searchQuery a Observable usando: toObservable(this.searchQuery)
  // 3. Aplica los operadores en la tubería pipe() y conviértelo de vuelta a señal usando toSignal().
  // 4. Elimina por completo el Subject, la Subscription, ngOnInit, ngOnDestroy y el método onSearchInput.
  // ============================================================================

  searchQuery: string = '';
  searchResults: Course[] = [];

  // Subject para emitir los términos de búsqueda
  private searchSubject$ = new Subject<string>();
  
  // Guardamos la suscripción para desuscribirnos en el ciclo OnDestroy
  private searchSubscription = new Subscription();

  ngOnInit() {
    super.ngOnInit();
    this.searchSubscription = this.searchSubject$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((query) => this.searchService.search(query))
    ).subscribe((results) => {
      this.searchResults = results; // Asignación de estado imperativa
    });

    // Carga inicial para mostrar todos los cursos al arrancar el componente
    this.searchSubject$.next('');
  }

  // Método disparado desde la UI por cada cambio en el input
  onSearchInput(value: string) {
    this.searchQuery = value;
    this.searchSubject$.next(value);
  }

  ngOnDestroy() {
    // Liberación manual obligatoria de memoria en RxJS clásico para evitar fugas
    this.searchSubscription.unsubscribe();
  }
}
