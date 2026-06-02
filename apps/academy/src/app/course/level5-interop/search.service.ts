import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Course {
  id: string;
  title: string;
  category: string;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  emoji: string;
}

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private readonly courses: Course[] = [
    { id: 'c1', title: 'Angular Signals Esenciales', category: 'Signals', difficulty: 'Principiante', emoji: '⚡' },
    { id: 'c2', title: 'Reactividad Avanzada con RxJS', category: 'RxJS', difficulty: 'Avanzado', emoji: '🔄' },
    { id: 'c3', title: 'Clean Architecture en Angular', category: 'Arquitectura', difficulty: 'Avanzado', emoji: '🏗️' },
    { id: 'c4', title: 'Angular Control Flow Moderno', category: 'Core', difficulty: 'Principiante', emoji: '🧩' },
    { id: 'c5', title: 'Detección de Cambios Zoneless', category: 'Performance', difficulty: 'Avanzado', emoji: '🚀' },
    { id: 'c6', title: 'Gestión de Estado con Signal Store', category: 'Signals', difficulty: 'Intermedio', emoji: '🗄️' },
  ];

  /**
   * Simula una petición HTTP de búsqueda con latencia asíncrona.
   */
  search(query: string): Observable<Course[]> {
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) {
      return of(this.courses).pipe(delay(150));
    }

    const filtered = this.courses.filter(
      (c) =>
        c.title.toLowerCase().includes(cleanQuery) ||
        c.category.toLowerCase().includes(cleanQuery)
    );

    // Simular un retardo de red de 200ms
    return of(filtered).pipe(delay(200));
  }
}
