import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../typescript/interfaces';

@Injectable({
  providedIn: 'root',
})

export class StoreService {

  private activeChatIDSubject = new BehaviorSubject<string>('');
  private loggedUserSubject = new BehaviorSubject<User | null>(this.getLoggedUserFromLocalStorage());
  private requestCounterSubject = new BehaviorSubject<number>(0);

  chatID$ = this.activeChatIDSubject.asObservable();
  loggedUser$ = this.loggedUserSubject.asObservable();
  counter$ = this.requestCounterSubject.asObservable();

  updateChatID(newChatID: string) {
    this.activeChatIDSubject.next(newChatID);
  }

  updateCounter(newCount: number) {
    this.requestCounterSubject.next(newCount);
  }

  setLoggedUser(user: User) {
    localStorage.setItem('loggedUser', JSON.stringify(user));
    this.loggedUserSubject.next(user);
  }

  updateAvatar(avatarUrl: string) {
    const currentUser = this.loggedUserSubject.value;
    if (currentUser) {
      const updatedUser = { ...currentUser, avatar: avatarUrl };
      localStorage.setItem('loggedUser', JSON.stringify(updatedUser));
      this.loggedUserSubject.next(updatedUser);
    }
  }

  removeLoggedUser() {
    localStorage.removeItem('loggedUser');
    this.loggedUserSubject.next(null);
  }

  private getLoggedUserFromLocalStorage(): User | null {
    const loggedUser = localStorage.getItem('loggedUser');
    return loggedUser ? JSON.parse(loggedUser) : null;
  }

  getLoggedUser() {
    return this.loggedUserSubject.value;
  }
}
