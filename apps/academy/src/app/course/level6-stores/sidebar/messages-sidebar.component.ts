import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessagesStore } from '../messages-store';
import { Message } from '../rxjs-messages.service';

@Component({
  selector: 'app-messages-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './messages-sidebar.component.html'
})
export class MessagesSidebarComponent {
  // Inyectamos de forma segura el store global de @ngrx/signals desde el nivel superior
  protected store: any = (() => {
    try {
      if (MessagesStore) {
        return inject(MessagesStore);
      }
    } catch (e) {
      console.warn('MessagesStore no está disponible en MessagesSidebarComponent:', e);
    }
    // Respaldo reactivo temporal para evitar excepciones en vuelo
    return {
      messages: () => [] as Message[],
      filter: () => 'all' as 'all' | 'unread',
      unreadCount: () => 0,
      setFilter: () => {}
    };
  })();

  protected selectFilter(filter: 'all' | 'unread') {
    if (this.store && typeof this.store.setFilter === 'function') {
      this.store.setFilter(filter);
    }
  }
}
