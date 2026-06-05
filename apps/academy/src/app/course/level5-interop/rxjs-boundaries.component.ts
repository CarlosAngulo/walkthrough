import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { LearningComponent } from '../../engine/learning.component';
import { learningStateStore } from '@learning-engine/learning-state';
import { SearchService, Course } from './search.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

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
  // 2. Convierte searchQuery$ a Observable usando: toObservable(this.searchQuery)
  // 3. Aplica los operadores en la tubería pipe() y conviértelo de vuelta a señal usando toSignal().
  // 4. Mueve la invocación de _setupSearchPipeline al constructor y elimina ngOnInit/ngOnDestroy.
  // ============================================================================

  searchQuery: string = '';
  searchResults: Course[] = [];

  // Subject para emitir los términos de búsqueda
  private _searchSubject$ = new Subject<string>();
  
  // Guardamos la suscripción para desuscribirnos en el ciclo OnDestroy
  private _searchSubscription = new Subscription();

  ngOnInit() {
    super.ngOnInit();
    this.setupSearchPipeline();
  }

  // Método disparado desde la UI por cada cambio en el input
  onSearchInput(value: string) {
    this.searchQuery = value;
    this._searchSubject$.next(value);
  }

  ngOnDestroy() {
    // Liberación manual obligatoria de memoria en RxJS clásico para evitar fugas
    this._searchSubscription.unsubscribe();
  }

  // Lógica de configuración de búsqueda imperativa inicial
  private setupSearchPipeline() {
    this._searchSubscription = this._searchSubject$.pipe(
      debounceTime(400), // Espera 400ms después del último evento antes de continuar
      distinctUntilChanged(), // Solo emite si el valor ha cambiado
      switchMap((query) => this.searchService.search(query)) // Cambia a un nuevo Observable de búsqueda cada vez que el término cambia
    ).subscribe((results) => {
      this.searchResults = results; // Asignación de estado imperativa
    });

    // Carga inicial para mostrar todos los cursos al arrancar el componente
    this._searchSubject$.next('');
  }
}
