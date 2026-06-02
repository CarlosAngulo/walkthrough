import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../rxjs-messages.service';
import { MessagesStore } from '../messages-store';

@Component({
  selector: 'app-message-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-item.component.html'
})
export class MessageItemComponent {
  @Input({ required: true }) message!: Message;

  // Inyectamos de forma segura el store global compartido desde el nivel superior
  protected store: any = (() => {
    try {
      if (MessagesStore) {
        return inject(MessagesStore);
      }
    } catch (e) {
      console.warn('MessagesStore no está disponible en MessageItemComponent:', e);
    }
    // Respaldo reactivo temporal para evitar excepciones en vuelo
    return {
      markAsRead: () => {}
    };
  })();

  protected markAsRead() {
    if (this.store && typeof this.store.markAsRead === 'function') {
      this.store.markAsRead(this.message.id);
    }
  }
}
