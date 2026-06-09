import { Component, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { MessagesStore } from '../messages-store';
import { RxjsMessagesService, Message } from '../rxjs-messages.service';

@Component({
  selector: 'app-messages-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './messages-sidebar.component.html'
})
export class MessagesSidebarComponent {
  // Safely inject global @ngrx/signals store from top level
  protected store: any = (() => {
    try {
      if (MessagesStore) {
        return inject(MessagesStore);
      }
    } catch (e) {
      console.warn('MessagesStore is not available in MessagesSidebarComponent:', e);
    }
    // Temporary reactive fallback (Option B: Traditional RxJS Service)
    const service = inject(RxjsMessagesService);
    const messages = toSignal(service.messages$ || of([]), { initialValue: [] as Message[] });
    const filter = toSignal(service.filter$ || of('all'), { initialValue: 'all' as 'all' | 'unread' });

    return {
      messages,
      filter,
      unreadCount: computed(() => messages().filter(m => !m.read).length),
      setFilter: (f: 'all' | 'unread') => service.setFilter?.(f)
    };
  })();

  protected selectFilter(filter: 'all' | 'unread') {
    if (this.store && typeof this.store.setFilter === 'function') {
      this.store.setFilter(filter);
    }
  }
}
