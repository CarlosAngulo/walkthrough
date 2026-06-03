import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Message {
  id: string;
  sender: string;
  subject: string;
  body: string;
  time: string;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RxjsMessagesService {
  private initialMessages: Message[] = [
    {
      id: '1',
      sender: 'Prof. Ana Martínez',
      subject: 'Retroalimentación del Reto 5',
      body: '¡Hola! Excelente trabajo resolviendo la interoperabilidad con RxJS. Tu código cumple con todas las buenas prácticas.',
      time: 'Hace 10 min',
      read: false
    },
    {
      id: '2',
      sender: 'Soporte Técnico',
      subject: 'Actualización de Cuenta Premium',
      body: 'Se ha habilitado tu acceso a los laboratorios de Zoneless y Custom Stores en Signals Academy.',
      time: 'Hace 1 hora',
      read: false
    },
    {
      id: '3',
      sender: 'Comunidad Signals',
      subject: 'Invitación al Angular Meetup',
      body: 'No te pierdas la charla sobre el futuro de la gestión de estado reactiva en Angular.',
      time: 'Ayer',
      read: true
    }
  ];

  // ==========================================
  // ESTADO TRADICIONAL BASADO EN RXJS (OPCIÓN B)
  // ==========================================
  private messagesSubject$ = new BehaviorSubject<Message[]>([]);
  readonly messages$ = this.messagesSubject$.asObservable();

  private filterSubject$ = new BehaviorSubject<'all' | 'unread'>('all');
  readonly filter$ = this.filterSubject$.asObservable();

  private loadingSubject$ = new BehaviorSubject<boolean>(false);
  readonly loading$ = this.loadingSubject$.asObservable();

  getMessages(): Observable<Message[]> {
    // Simula una latencia de red de 600ms para demostrar el estado loading
    return of(this.initialMessages).pipe(delay(600));
  }

  // Métodos del Store tradicional
  loadMessages(messages: Message[]) {
    this.messagesSubject$.next(messages);
    this.loadingSubject$.next(false);
  }

  setFilter(filter: 'all' | 'unread') {
    this.filterSubject$.next(filter);
  }

  markAsRead(messageId: string) {
    const updated = this.messagesSubject$.value.map(m =>
      m.id === messageId ? { ...m, read: true } : m
    );
    this.messagesSubject$.next(updated);
  }

  setLoading(loading: boolean) {
    this.loadingSubject$.next(loading);
  }
}
