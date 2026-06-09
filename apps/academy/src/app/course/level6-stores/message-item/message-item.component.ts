import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RxjsMessagesService, Message } from '../rxjs-messages.service';
import { MessagesStore } from '../messages-store';

@Component({
  selector: 'app-message-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-item.component.html'
})
export class MessageItemComponent {
  message = input.required<Message>();

  // Safely inject the shared global store from the top level
  protected store: any = (() => {
    try {
      if (MessagesStore) {
        return inject(MessagesStore);
      }
    } catch (e) {
      console.warn('MessagesStore is not available in MessageItemComponent:', e);
    }
    // Temporary reactive fallback (Option B: Traditional RxJS Service)
    const service = inject(RxjsMessagesService);
    return {
      markAsRead: (id: string) => service.markAsRead(id)
    };
  })();

  protected markAsRead() {
    if (this.store && typeof this.store.markAsRead === 'function') {
      this.store.markAsRead(this.message().id);
    }
  }
}
