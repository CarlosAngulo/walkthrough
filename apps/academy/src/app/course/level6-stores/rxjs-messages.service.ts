import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';

export type Message = {
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
  private _initialMessages: Message[] = [
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
  // ESTADO TRADICIONAL BASADO EN RXJS
  // ==========================================
  private _messagesSubject$ = new BehaviorSubject<Message[]>([]);
  readonly messages$ = this._messagesSubject$.asObservable();

  private _filterSubject$ = new BehaviorSubject<'all' | 'unread'>('all');
  readonly filter$ = this._filterSubject$.asObservable();

  private _loadingSubject$ = new BehaviorSubject<boolean>(false);
  readonly loading$ = this._loadingSubject$.asObservable();

  getMessages(): Observable<Message[]> {
    // Simula una latencia de red de 600ms para demostrar el estado loading
    return of(this._initialMessages).pipe(delay(600));
  }

  // Métodos del Store tradicional
  loadMessages(messages: Message[]) {
    this._messagesSubject$.next(messages);
    this._loadingSubject$.next(false);
  }

  setFilter(filter: 'all' | 'unread') {
    this._filterSubject$.next(filter);
  }

  markAsRead(messageId: string) {
    const updated = this._messagesSubject$.value.map(m =>
      m.id === messageId ? { ...m, read: true } : m
    );
    this._messagesSubject$.next(updated);
  }

  setLoading(loading: boolean) {
    this._loadingSubject$.next(loading);
  }
}
