import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LearningComponent } from '../../engine/learning.component';
import { learningStateStore } from '@learning-engine/learning-state';
import { RxjsMessagesService, Message } from './rxjs-messages.service';
import { MessagesStore, CustomStore } from './messages-store';
import { MessagesSidebarComponent } from './messages-sidebar.component';
import { MessageItemComponent } from './message-item.component';

@Component({
  selector: 'app-messages-list',
  standalone: true,
  imports: [CommonModule, MessagesSidebarComponent, MessageItemComponent],
  templateUrl: './messages-list.component.html',
  host: {
    class: 'block-messages-list'
  }
})
export class MessagesListComponent extends LearningComponent implements OnInit {
  // ==========================================
  // Configuración del Nivel y Logros
  // ==========================================
  protected override level = 'nivel-6';

  protected onLevelCompleted() {
    learningStateStore.addAchievement(
      'L6_SIGNAL_STORES',
      'Architect State Guru 🏛️',
      'Dominaste la arquitectura de stores centralizados con @ngrx/signals y construiste tu propio Custom Store.',
      '🏛️'
    );
    learningStateStore.completeLevel(this.level);
  }
  // ==========================================

  // Inyectar el servicio de simulación de mensajería académica
  protected messagesService = inject(RxjsMessagesService);

  // ============================================================================
  // DEMO PARTE 1: DIY Custom Store (Demostración Práctica)
  // ============================================================================
  // Instanciamos el Custom Store de la Parte 1 para demostrar su funcionamiento en la UI.
  protected customCounterStore = new CustomStore<{ count: number }>({ count: 10 });
  
  protected incrementCustomStore() {
    this.customCounterStore.update(s => ({ count: s.count + 1 }));
  }

  // ============================================================================
  // PARTE 2: Inyección de @ngrx/signals MessagesStore
  // ============================================================================
  // TODO: Una vez que declares tu MessagesStore usando signalStore() en messages-store.ts,
  // el inyector de Angular te permitirá obtener la instancia global única (Singleton).
  //
  // Pista: protected store = inject(MessagesStore);
  
  protected store: any = (() => {
    try {
      if (MessagesStore) {
        return inject(MessagesStore);
      }
    } catch (e) {
      console.warn('MessagesStore no está listo aún para ser inyectado:', e);
    }
    // Retorno de respaldo reactivo temporal para evitar excepciones en la renderización inicial.
    return {
      messages: signal([] as Message[]),
      filter: signal('all' as 'all' | 'unread'),
      loading: signal(false),
      filteredMessages: computed(() => [] as Message[]),
      unreadCount: computed(() => 0),
      loadMessages: () => {},
      setFilter: () => {},
      markAsRead: () => {},
      setLoading: () => {}
    };
  })();

  ngOnInit() {
    // Al iniciar el componente, activamos el estado de carga y obtenemos los mensajes del servicio.
    if (this.store && typeof this.store.setLoading === 'function') {
      this.store.setLoading(true);
      this.messagesService.getMessages().subscribe({
        next: (msgs) => {
          this.store.loadMessages(msgs);
        },
        error: () => {
          this.store.setLoading(false);
        }
      });
    }
  }
}
