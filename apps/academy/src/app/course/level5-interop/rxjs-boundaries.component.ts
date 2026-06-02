import { Component, inject, signal } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { LearningComponent } from '../../engine/learning.component';
import { learningStateStore } from '@learning-engine/learning-state';
import { SearchService, Course } from './search.service';

@Component({
  selector: 'app-rxjs-boundaries',
  standalone: true,
  templateUrl: './rxjs-boundaries.component.html',
  host: {
    class: 'block-rxjs-boundaries'
  }
})
export class RxjsBoundariesComponent extends LearningComponent {
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
  // Fin de la sección de configuración del nivel. El resto del código es tu área de trabajo para el reto de este nivel.
  // ==========================================

  // Inyectar el mock SearchService
  protected searchService = inject(SearchService);

  // Inicializador mock seguro que simula una Signal para evitar que el template HTML explote al iniciar el nivel.
  // Tu reto consiste en reemplazar esto por una Writable Signal real de Angular: searchQuery = signal<string>('');
  searchQuery: any = (() => {
    const fn: any = () => fn.value;
    fn.value = '';
    fn.set = (val: string) => { fn.value = val; };
    return fn;
  })();

  // ==========================================
  // RETO 2, 3 y 4: Puenteo a RxJS y Conversión de Vuelta
  // ==========================================
  // TODO: Crea el flujo del buscador predictivo puenteando señales y observables.
  // 1. Convierte la señal searchQuery en un observable usando la función: toObservable(this.searchQuery)
  // 2. Encadena los operadores de RxJS en un pipe:
  //    - debounceTime(400) para retrasar la búsqueda mientras el usuario escribe.
  //    - distinctUntilChanged() para evitar peticiones repetidas con el mismo término.
  //    - switchMap(query => this.searchService.search(query)) para buscar y descartar peticiones obsoletas en vuelo.
  // 3. Convierte el observable final de vuelta a una señal usando la función: toSignal()
  //    ¡No olvides pasar la opción { initialValue: [] } como segundo parámetro para evitar que la señal retorne undefined al inicio!
  //
  // Pista de código:
  //
  // private searchQuery$ = toObservable(this.searchQuery).pipe(
  //   debounceTime(400),
  //   distinctUntilChanged(),
  //   switchMap((query) => this.searchService.search(query))
  // );
  //
  // searchResults = toSignal(this.searchQuery$, { initialValue: [] as Course[] });

  // Boilerplate temporal sin reactividad asíncrona para que no rompa el compilador al inicio.
  // Borra estas dos líneas y descomenta/adapta la pista de arriba al resolver el reto.
  searchResults: any = () => [];
}
