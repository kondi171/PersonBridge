import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { FriendSettingsData, MessageRow, User } from '../typescript/interfaces';
import { ChatType } from '../typescript/enums';

@Injectable({
  providedIn: 'root',
})
export class StoreService {

  private loggedUserSubject = new BehaviorSubject<User | null>(this.getLoggedUserFromLocalStorage());
  loggedUser$ = this.loggedUserSubject.asObservable();

  private newMessageSubject = new Subject<void>();
  newMessage$ = this.newMessageSubject.asObservable();

  private activeChatIDSubject = new BehaviorSubject<string>(this.checkActiveChatID());
  chatID$ = this.activeChatIDSubject.asObservable();

  private activeChatTypeSubject = new BehaviorSubject<ChatType>(this.checkActiveChatType());
  chatType$ = this.activeChatTypeSubject.asObservable();

  private requestCounterSubject = new BehaviorSubject<number>(0);
  counter$ = this.requestCounterSubject.asObservable();

  private accessibilitySource = new BehaviorSubject<{ [key: string]: FriendSettingsData['accessibility'] }>({});
  accessibility$ = this.accessibilitySource.asObservable();

  private forceRefreshMessagesSubject = new BehaviorSubject<boolean>(false);
  refreshMessages$ = this.forceRefreshMessagesSubject.asObservable();

  updateChatID(newChatID: string) { this.activeChatIDSubject.next(newChatID); }

  updateChatType(newChatType: ChatType) {
    this.activeChatTypeSubject.next(newChatType);
  }

  updateCounter(newCount: number) {
    this.requestCounterSubject.next(newCount);
  }

  forceRefreshMessages(force: boolean) {
    this.forceRefreshMessagesSubject.next(force);
  }

  updateAccessibility(friendID: string, accessibility: FriendSettingsData['accessibility']) {
    const current = this.accessibilitySource.value;
    this.accessibilitySource.next({
      ...current,
      [friendID]: accessibility
    });
  }

  private checkActiveChatID(): string {
    const loggedUser = this.getLoggedUserFromLocalStorage();
    if (loggedUser) {
      if (loggedUser.friends.length === 0) return 'no-messages';
      else return loggedUser.friends[0].id;
    } else return 'no-messages';
  }

  private checkActiveChatType(): ChatType {
    return ChatType.USER_CHAT;
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
  updateLoggedUserRequests(requests: string[]) {
    const user = this.loggedUserSubject.getValue();
    if (user) {
      user.requests.sent = requests;
      this.loggedUserSubject.next(user);
    }
  }

  removeLoggedUser() {
    localStorage.removeItem('loggedUser');
    localStorage.clear();
    this.loggedUserSubject.next(null);
  }

  private getLoggedUserFromLocalStorage(): User | null {
    const loggedUser = localStorage.getItem('loggedUser');
    return loggedUser ? JSON.parse(loggedUser) : null;
  }

  getLoggedUser() {
    return this.loggedUserSubject.value;
  }

  notifyNewMessage() {
    this.newMessageSubject.next();
  }

}
