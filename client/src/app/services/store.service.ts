import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../typescript/interfaces';
import { ChatType } from '../typescript/enums';

@Injectable({
  providedIn: 'root',
})

export class StoreService {

  private loggedUserSubject = new BehaviorSubject<User | null>(this.getLoggedUserFromLocalStorage());
  private activeChatIDSubject = new BehaviorSubject<string>(this.checkActiveChatID());
  private activeChatTypeSubject = new BehaviorSubject<ChatType>(this.checkActiveChatType());
  private requestCounterSubject = new BehaviorSubject<number>(0);

  loggedUser$ = this.loggedUserSubject.asObservable();
  chatID$ = this.activeChatIDSubject.asObservable();
  chatType$ = this.activeChatTypeSubject.asObservable();
  counter$ = this.requestCounterSubject.asObservable();

  updateChatID(newChatID: string) {
    this.activeChatIDSubject.next(newChatID);
  }
  updateChatType(newChatType: ChatType) {
    this.activeChatTypeSubject.next(newChatType);
  }
  updateCounter(newCount: number) {
    this.requestCounterSubject.next(newCount);
  }
  private checkActiveChatID(): string {
    const loggedUser = this.getLoggedUserFromLocalStorage();
    if (loggedUser) {
      // return "664ba4822cf66b114b6490f8";
      if (loggedUser.friends.length === 0) return 'no-messages'
      else return loggedUser.friends[0].id;
    } else return 'no-messages';
    // return 'no-messages';
  }

  private checkActiveChatType(): ChatType {
    return ChatType.USER_CHAT
  }
  getChatType(): ChatType {
    return this.activeChatTypeSubject.getValue();
  }
  setLoggedUser(user: User) {
    localStorage.setItem('loggedUser', JSON.stringify(user));
    this.loggedUserSubject.next(user);
  }
  updateUserStatus(status: string) {
    const user = this.loggedUserSubject.getValue();
    if (user) {
      user.status = status;
      this.loggedUserSubject.next(user);
    }
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
