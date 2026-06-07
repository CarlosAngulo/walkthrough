import { signal, computed, Signal } from '@angular/core';
import { Message } from './rxjs-messages.service';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';

// ============================================================================
// PARTE 1: DIY (Do It Yourself) Signal Store
// ============================================================================
// Antes de usar la biblioteca oficial @ngrx/signals, implementaremos un contenedor
// de estado simple basado en señales "hecho por nosotros mismos". Esto te enseñará
// la base técnica de cómo encapsular estado mutable y exponer solo lecturas reactivas.
// ============================================================================
export class CustomStore<T> {
  // TODO: Reto 0 - Haz que este store DIY funcione.
  // 1. Declara un WritableSignal interno privado para almacenar el estado: private _state
  // 2. Expón el estado de solo lectura usando un computed(): readonly state
  // 3. Define un método update(fn) que llame a this._state.update(fn)
  
  private _state: any;
  readonly state: any;

  constructor(initialState: T) {
    this._state = signal<T>(initialState);
    this.state = computed(() => this._state());
  }

  update(fn: (state: T) => T): void {
    this._state.update(fn);
  }
}

// ============================================================================
// PARTE 2: Store Reactivo Moderno con @ngrx/signals
// ============================================================================
// Ahora utilizaremos la solución estándar del ecosistema de Angular: @ngrx/signals.
// El store gestionará la bandeja de entrada con el siguiente estado:
// - messages: Array de mensajes académicos.
// - filter: Filtro activo ('all' o 'unread').
// - loading: Estado de carga asíncrona.
// ============================================================================

export interface MessagesState {
  messages: Message[];
  filter: 'all' | 'unread';
  loading: boolean;
}

const initialState: MessagesState = {
  messages: [],
  filter: 'all',
  loading: false
};

// TODO: Retos 1, 2, 3 y 4.
// Reemplaza la constante MessagesStore temporal por la implementación oficial:
//
// export const MessagesStore = signalStore(
//   { providedIn: 'root' },
//   withState(initialState),
//   withComputed((store) => ({
//     unreadCount: computed(() => store.messages().filter(m => !m.read).length),
//     filteredMessages: computed(() => {
//       const filter = store.filter();
//       const messages = store.messages();
//       return filter === 'unread' ? messages.filter(m => !m.read) : messages;
//     })
//   })),
//   withMethods((store) => ({
//     loadMessages(messages: Message[]) {
//       patchState(store, { messages, loading: false });
//     },
//     setFilter(filter: 'all' | 'unread') {
//       patchState(store, { filter });
//     },
//     markAsRead(messageId: string) {
//       patchState(store, (state) => ({
//         messages: state.messages.map(m => m.id === messageId ? { ...m, read: true } : m)
//       }));
//     },
//     setLoading(loading: boolean) {
//       patchState(store, { loading });
//     }
//   }))
// );

// Boilerplate inicial para evitar errores de compilación antes de la implementación del alumno.
export const MessagesStore: any = null;
