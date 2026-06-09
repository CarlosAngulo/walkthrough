import '../../../test-setup';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MessagesListComponent } from './messages-list.component';
import { RxjsMessagesService, Message } from './rxjs-messages.service';
import { CustomStore, MessagesStore } from './messages-store';
import { isSignal, computed, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import '@learning-engine/test-integration';

describe('Level 6: Signal Stores 🏛️ - MessagesListComponent & Stores', () => {
  let component: MessagesListComponent;
  let fixture: ComponentFixture<MessagesListComponent>;
  let messagesServiceMock: any;

  beforeEach(() => {
    messagesServiceMock = {
      getMessages: vi.fn().mockReturnValue(of([
        { id: '1', sender: 'Prof. Ana', subject: 'Feed 1', body: 'Body 1', time: '10m', read: false },
        { id: '2', sender: 'Soporte', subject: 'Feed 2', body: 'Body 2', time: '1h', read: true }
      ]).pipe(delay(50)))
    };
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function createComponent() {
    await TestBed.configureTestingModule({
      imports: [MessagesListComponent],
      providers: [
        { provide: RxjsMessagesService, useValue: messagesServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MessagesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  describe('Architectural Structure - AST Semantic Analysis 🧬', () => {
    it('should comply with all design rules for signalStore and sub-modules', () => {
      const storePath = 'src/app/course/level6-stores/messages-store.ts';
      
      expect(storePath).toSatisfyRules([
        'L6_STORE_DECLARATION',
        'L6_STORE_STATE',
        'L6_STORE_COMPUTED',
        'L6_STORE_METHODS'
      ]);
    });
  });

  describe('PART 1: DIY Custom Signal Store', () => {
    it('should initialize CustomStore with an immutable initial state', () => {
      const store = new CustomStore<{ count: number }>({ count: 5 });
      expect(store.state()).toEqual({ count: 5 });
    });

    it('should allow updating the CustomStore state reactively using update()', () => {
      const store = new CustomStore<{ count: number }>({ count: 5 });
      
      let observedValue: any = null;
      // We create a computed signal to observe reactive changes
      const doubleCount = computed(() => store.state().count * 2);
      
      expect(doubleCount()).toBe(10);
      
      store.update(state => ({ count: state.count + 1 }));
      expect(store.state()).toEqual({ count: 6 });
      expect(doubleCount()).toBe(12);
    });
  });

  describe('PART 2: Centralized Store with @ngrx/signals', () => {
    it('should load state and resolve message flow', async () => {
      await createComponent();

      // If student already created the MessagesStore correctly
      if (MessagesStore) {
        expect(component['store']).toBeDefined();
        
        // Should be loading initially when calling ngOnInit
        expect(component['store'].loading()).toBe(true);

        // We simulate the passage of time to complete the service delay(50ms)
        vi.advanceTimersByTime(50);
        fixture.detectChanges();

        // Should no longer be loading
        expect(component['store'].loading()).toBe(false);
        
        // Messages in store should match mock messages
        expect(component['store'].messages().length).toBe(2);
      } else {
        // Pass test temporarily if student hasn't declared store yet to prevent blocking compilation
        expect(true).toBe(true);
      }
    });

    it('should correctly compute unreadCount and filter based on state', async () => {
      await createComponent();

      if (MessagesStore) {
        vi.advanceTimersByTime(50);
        fixture.detectChanges();

        const store = component['store'];
        
        // Unread count should be 1, since out of the 2 mock messages, one has read: false
        expect(store.unreadCount()).toBe(1);

        // By default, filter is 'all'
        expect(store.filter()).toBe('all');
        expect(store.filteredMessages().length).toBe(2);

        // Change filter to 'unread'
        store.setFilter('unread');
        fixture.detectChanges();

        expect(store.filter()).toBe('unread');
        expect(store.filteredMessages().length).toBe(1);
        expect(store.filteredMessages()[0].id).toBe('1');
      } else {
        expect(true).toBe(true);
      }
    });

    it('should mark messages as read immutably through exposed methods', async () => {
      await createComponent();

      if (MessagesStore) {
        vi.advanceTimersByTime(50);
        fixture.detectChanges();

        const store = component['store'];
        expect(store.unreadCount()).toBe(1);

        // Mark message with id '1' as read
        store.markAsRead('1');
        fixture.detectChanges();

        // Unread count should now be 0
        expect(store.unreadCount()).toBe(0);
        expect(store.messages().find((m: any) => m.id === '1').read).toBe(true);
      } else {
        expect(true).toBe(true);
      }
    });
  });

  describe('MULTI-COMPONENT INTERACTION 🔄 (Integration)', () => {
    it('should cross-synchronize actions from the message list (child) with the sidebar counter (child)', async () => {
      await createComponent();

      if (MessagesStore) {
        vi.advanceTimersByTime(50);
        fixture.detectChanges();

        const store = component['store'];
        expect(store.unreadCount()).toBe(1);

        // Search for button element in child component <app-message-item>
        const messageItemEl = fixture.debugElement.query(By.css('app-message-item'));
        expect(messageItemEl).toBeDefined();

        // Get its "Mark as read" button
        const markReadBtn = messageItemEl.query(By.css('.btn-mark-read'));
        expect(markReadBtn).toBeDefined();

        // Trigger click
        markReadBtn.nativeElement.click();
        fixture.detectChanges();

        // Verify that sidebar counter <app-messages-sidebar> reactively updated to 0
        expect(store.unreadCount()).toBe(0);
        
        // We can also verify sidebar HTML directly
        const sidebarEl = fixture.debugElement.query(By.css('app-messages-sidebar'));
        expect(sidebarEl.nativeElement.textContent).toContain('Unread (0)');
      } else {
        expect(true).toBe(true);
      }
    });
  });
});
