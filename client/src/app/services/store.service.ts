import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../typescript/interfaces';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  private activeChatID: string = '';

  private userSubject = new BehaviorSubject<User | null>(this.getLoggedUserFromLocalStorage());
  private requestCounter = new BehaviorSubject<number>(0);
  user$ = this.userSubject.asObservable();
  counter$ = this.requestCounter.asObservable();

  updateCounter(newCount: number) {
    this.requestCounter.next(newCount);
  }

  setLoggedUser(user: User) {
    localStorage.setItem('loggedUser', JSON.stringify(user));
    this.userSubject.next(user);
  }
  updateAvatar(avatarUrl: string) {
    const currentUser = this.userSubject.value;
    if (currentUser) {
      const updatedUser = { ...currentUser, avatar: avatarUrl };
      localStorage.setItem('loggedUser', JSON.stringify(updatedUser));
      this.userSubject.next(updatedUser);
    }
  }
  removeLoggedUser() {
    localStorage.removeItem('loggedUser');
    this.userSubject.next(null);
  }

  private getLoggedUserFromLocalStorage(): User | null {
    const loggedUser = localStorage.getItem('loggedUser');
    return loggedUser ? JSON.parse(loggedUser) : null;
  }

  getLoggedUser() {
    return this.userSubject.value;
  }

  setActiveChatID(id: string) {
    this.activeChatID = id;
  }

  getActiveChatID() {
    return this.activeChatID;
  }

  setUserToken(token: string) {
    localStorage.setItem('userToken', token);
  }

  getUserToken() {
    localStorage.getItem('userToken');
    return localStorage.getItem('userToken');
  }
}
