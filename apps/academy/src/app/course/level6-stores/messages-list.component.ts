import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { LearningComponent } from '../../engine/learning.component';
import { learningStateStore } from '@learning-engine/learning-state';
import { RxjsMessagesService, Message } from './rxjs-messages.service';
import { MessagesStore, CustomStore } from './messages-store';
import { MessagesSidebarComponent } from './sidebar/messages-sidebar.component';
import { MessageItemComponent } from './message-item/message-item.component';

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
  // Level Configuration and Achievements
  // ==========================================
  protected override level = 'nivel-6';

  protected onLevelCompleted() {
    learningStateStore.addAchievement(
      'L6_SIGNAL_STORES',
      'Architect State Guru 🏛️',
      'You mastered centralized store architecture with @ngrx/signals and built your own Custom Store.',
      '🏛️'
    );
    learningStateStore.completeLevel(this.level);
  }
  // ==========================================

  // Inject academic messaging simulation service
  protected messagesService = inject(RxjsMessagesService);

  // ============================================================================
  // DEMO PART 1: DIY Custom Store (Practical Demonstration)
  // ============================================================================
  // We instantiate the Part 1 Custom Store to demonstrate its functionality in the UI.
  protected customCounterStore = new CustomStore<{ count: number }>({ count: 10 });
  
  protected incrementCustomStore() {
    this.customCounterStore.update(s => ({ count: s.count + 1 }));
  }

  // ============================================================================
  // PART 2: NgRx Signals MessagesStore Injection
  // ============================================================================
  // TODO: Once you declare your MessagesStore using signalStore() in messages-store.ts,
  // the Angular injector will let you obtain the unique global instance (Singleton).
  //
  // Hint: protected store = inject(MessagesStore);
  
  protected store: any = (() => {
    try {
      if (MessagesStore) {
        return inject(MessagesStore);
      }
    } catch (e) {
      console.warn('MessagesStore is not ready to be injected yet:', e);
    }
    // Temporary reactive fallback return (Option B: Traditional RxJS Service)
    const service = inject(RxjsMessagesService);
    const messages = toSignal(service.messages$ || of([]), { initialValue: [] as Message[] });
    const filter = toSignal(service.filter$ || of('all'), { initialValue: 'all' as 'all' | 'unread' });
    const loading = toSignal(service.loading$ || of(false), { initialValue: false });

    return {
      messages,
      filter,
      loading,
      filteredMessages: computed(() => {
        const f = filter();
        const msgs = messages();
        return f === 'unread' ? msgs.filter(m => !m.read) : msgs;
      }),
      unreadCount: computed(() => messages().filter(m => !m.read).length),
      loadMessages: (msgs: Message[]) => service.loadMessages?.(msgs),
      setFilter: (f: 'all' | 'unread') => service.setFilter?.(f),
      markAsRead: (id: string) => service.markAsRead?.(id),
      setLoading: (l: boolean) => service.setLoading?.(l)
    };
  })();

  ngOnInit() {
    super.ngOnInit();
    // On startup, we activate loading state and load messages from the service.
    this.loadMessages();
  }
  
  private loadMessages() {
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
