import { Injectable } from '@angular/core';
import { User } from '../typescript/types';

@Injectable({
  providedIn: 'root',
})
export class StoreService {

  private activeChatID: string = '';

  setLoggedUser(user: User) { localStorage.setItem('loggedUser', JSON.stringify(user)); }
  removeLoggedUser() { localStorage.removeItem('loggedUser'); }

  getLoggedUser() {
    const loggedUser = localStorage.getItem('loggedUser');
    if (loggedUser) {
      const parsedLoggedUser = JSON.parse(loggedUser)
      return parsedLoggedUser;
    } else return null;
  }

  setActiveChatID(id: string) {
    this.activeChatID = id;
  }

  getActiveChatID() {
    return this.activeChatID;
  }
}
