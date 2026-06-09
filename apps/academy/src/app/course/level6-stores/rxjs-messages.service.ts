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
      subject: 'Challenge 5 Feedback',
      body: 'Hello! Excellent job resolving RxJS interoperability. Your code complies with all best practices.',
      time: '10 min ago',
      read: false
    },
    {
      id: '2',
      sender: 'Technical Support',
      subject: 'Premium Account Update',
      body: 'Your access to the Zoneless and Custom Stores labs in Signals Academy has been enabled.',
      time: '1 hour ago',
      read: false
    },
    {
      id: '3',
      sender: 'Signals Community',
      subject: 'Angular Meetup Invitation',
      body: 'Don\'t miss the talk about the future of reactive state management in Angular.',
      time: 'Yesterday',
      read: true
    }
  ];

  // ==========================================
  // TRADITIONAL STATE BASED ON RXJS
  // ==========================================
  private _messagesSubject$ = new BehaviorSubject<Message[]>([]);
  readonly messages$ = this._messagesSubject$.asObservable();

  private _filterSubject$ = new BehaviorSubject<'all' | 'unread'>('all');
  readonly filter$ = this._filterSubject$.asObservable();

  private _loadingSubject$ = new BehaviorSubject<boolean>(false);
  readonly loading$ = this._loadingSubject$.asObservable();

  getMessages(): Observable<Message[]> {
    // Simulates network latency of 600ms to demonstrate loading state
    return of(this._initialMessages).pipe(delay(600));
  }

  // Traditional Store methods
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
