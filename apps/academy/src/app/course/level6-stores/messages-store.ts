import { signal, computed, Signal } from '@angular/core';
import { Message } from './rxjs-messages.service';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';

// ============================================================================
// PART 1: DIY (Do It Yourself) Signal Store
// ============================================================================
// Before using the official @ngrx/signals library, we will implement a simple
// state container based on signals "made by ourselves". This will teach you
// the technical basis of how to encapsulate mutable state and expose only reactive read-onlys.
// ============================================================================
export class CustomStore<T> {
  // TODO: Challenge 0 - Make this DIY store work.
  // 1. Declare a private internal WritableSignal to store state: private _state
  // 2. Expose read-only state using computed(): readonly state
  // 3. Define an update(fn) method that calls this._state.update(fn)
  
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
// PART 2: Modern Reactive Store with @ngrx/signals
// ============================================================================
// Now we will use Angular's standard ecosystem solution: @ngrx/signals.
// The store will manage the inbox with the following state:
// - messages: Array of academic messages.
// - filter: Active filter ('all' or 'unread').
// - loading: Asynchronous loading state.
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

// TODO: Challenges 1, 2, 3 and 4.
// Replace the temporary MessagesStore constant with the official implementation:
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

// Initial boilerplate to avoid compilation errors before the student's implementation.
export const MessagesStore: any = null;
