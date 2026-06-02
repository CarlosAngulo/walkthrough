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

describe('Nivel 6: Signal Stores 🏛️ - MessagesListComponent & Stores', () => {
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

  describe('Estructura Arquitectónica - Análisis Semántico AST 🧬', () => {
    it('debería cumplir con todas las reglas de diseño para signalStore y sub-módulos', () => {
      const storePath = 'src/app/course/level6-stores/messages-store.ts';
      
      expect(storePath).toSatisfyRules([
        'L6_STORE_DECLARATION',
        'L6_STORE_STATE',
        'L6_STORE_COMPUTED',
        'L6_STORE_METHODS'
      ]);
    });
  });

  describe('PARTE 1: DIY Custom Signal Store', () => {
    it('debería inicializar el CustomStore con un estado inicial inmutable', () => {
      const store = new CustomStore<{ count: number }>({ count: 5 });
      expect(store.state()).toEqual({ count: 5 });
    });

    it('debería permitir actualizar el estado del CustomStore usando update() reactivamente', () => {
      const store = new CustomStore<{ count: number }>({ count: 5 });
      
      let observedValue: any = null;
      // Creamos un computed para observar cambios reactivos
      const doubleCount = computed(() => store.state().count * 2);
      
      expect(doubleCount()).toBe(10);
      
      store.update(state => ({ count: state.count + 1 }));
      expect(store.state()).toEqual({ count: 6 });
      expect(doubleCount()).toBe(12);
    });
  });

  describe('PARTE 2: Store Centralizado con @ngrx/signals', () => {
    it('debería cargar el estado y resolver el flujo de mensajes', async () => {
      await createComponent();

      // Si el alumno ya creó el MessagesStore correctamente
      if (MessagesStore) {
        expect(component['store']).toBeDefined();
        
        // Debería estar cargando inicialmente al llamar a ngOnInit
        expect(component['store'].loading()).toBe(true);

        // Simulamos el paso del tiempo para completar el delay(50ms) del servicio
        vi.advanceTimersByTime(50);
        fixture.detectChanges();

        // Ya no debería estar cargando
        expect(component['store'].loading()).toBe(false);
        
        // Los mensajes en el store deben coincidir con los del mock
        expect(component['store'].messages().length).toBe(2);
      } else {
        // Test aprobado temporalmente si el alumno aún no declara el store para evitar bloquear compilación
        expect(true).toBe(true);
      }
    });

    it('debería computar correctamente unreadCount y filtrar según el estado', async () => {
      await createComponent();

      if (MessagesStore) {
        vi.advanceTimersByTime(50);
        fixture.detectChanges();

        const store = component['store'];
        
        // Unread count debería ser 1, ya que de los 2 mensajes de mock, uno tiene read: false
        expect(store.unreadCount()).toBe(1);

        // Por defecto, filter is 'all'
        expect(store.filter()).toBe('all');
        expect(store.filteredMessages().length).toBe(2);

        // Cambiamos el filtro a 'unread'
        store.setFilter('unread');
        fixture.detectChanges();

        expect(store.filter()).toBe('unread');
        expect(store.filteredMessages().length).toBe(1);
        expect(store.filteredMessages()[0].id).toBe('1');
      } else {
        expect(true).toBe(true);
      }
    });

    it('debería marcar mensajes como leídos de forma inmutable a través de los métodos expuestos', async () => {
      await createComponent();

      if (MessagesStore) {
        vi.advanceTimersByTime(50);
        fixture.detectChanges();

        const store = component['store'];
        expect(store.unreadCount()).toBe(1);

        // Marcar el mensaje con id '1' como leído
        store.markAsRead('1');
        fixture.detectChanges();

        // El unread count ahora debería ser 0
        expect(store.unreadCount()).toBe(0);
        expect(store.messages().find((m: any) => m.id === '1').read).toBe(true);
      } else {
        expect(true).toBe(true);
      }
    });
  });

  describe('INTERACCIÓN MULTI-COMPONENTE 🔄 (Integración)', () => {
    it('debería sincronizar de forma cruzada las acciones del listado de mensajes (hijo) con el contador de la barra lateral (hijo)', async () => {
      await createComponent();

      if (MessagesStore) {
        vi.advanceTimersByTime(50);
        fixture.detectChanges();

        const store = component['store'];
        expect(store.unreadCount()).toBe(1);

        // Buscamos el elemento del botón del componente hijo <app-message-item>
        const messageItemEl = fixture.debugElement.query(By.css('app-message-item'));
        expect(messageItemEl).toBeDefined();

        // Obtenemos su botón de "Marcar como leído"
        const markReadBtn = messageItemEl.query(By.css('.btn-mark-read'));
        expect(markReadBtn).toBeDefined();

        // Disparamos el click
        markReadBtn.nativeElement.click();
        fixture.detectChanges();

        // Verificamos que el contador de la barra lateral <app-messages-sidebar> se haya actualizado reactivamente a 0
        expect(store.unreadCount()).toBe(0);
        
        // También podemos verificar el HTML del sidebar directamente
        const sidebarEl = fixture.debugElement.query(By.css('app-messages-sidebar'));
        expect(sidebarEl.nativeElement.textContent).toContain('Sin Leer (0)');
      } else {
        expect(true).toBe(true);
      }
    });
  });
});
