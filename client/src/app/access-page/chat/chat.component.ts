import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEllipsisV, faVideoCamera, faPhone, faSmile, faChevronLeft, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { MessageBoxComponent } from './message-box/message-box.component';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { StoreService } from '../../services/store.service';
import { Message } from '../../typescript/types';
import { GetUserService } from '../../services/get-user.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../app.environment';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, MessageBoxComponent, RouterModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  loggedUserID: string = '';
  activeFriendID: string = '';
  activeFriendName: string = '';
  activeFriendLastname: string = '';
  activeFriendStatus: string = '';
  activeFriendAvatar: string = '';
  activeFriendMessages: Message[] = [];
  yourName: string = "";
  yourAvatar: string = "";
  message: string = "";
  icons = {
    audio: faPhone,
    video: faVideoCamera,
    settings: faEllipsisV,
    emoticons: faSmile,
    back: faChevronLeft,
    send: faPaperPlane
  }

  constructor(private router: Router, private storeService: StoreService, private getUserService: GetUserService) {
    this.activeFriendID = storeService!.getActiveChatID();
    const loggedUser = storeService.getLoggedUser();
    if (loggedUser !== null) {
      this.yourName = loggedUser.name;
      this.yourAvatar = loggedUser.avatar;
    }

    this.findMessages(storeService!.getActiveChatID());
    this.checkUserID();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkUserID();
    });
  }

  findMessages(id: string) {
    const loggedUser = this.storeService!.getLoggedUser();
    // console.log(loggedUser)
    if (!loggedUser) {
      // Obsłuż przypadek, gdy getLoggedUser() zwraca null
      return;
    }

    this.loggedUserID = loggedUser._id;

    const settingsException = id.slice(-8);
    if (id.length !== 24 || settingsException === 'settings') return;

    this.getUserService.getUser(id)
      .then(data => {
        this.activeFriendName = data.name;
        this.activeFriendLastname = data.lastname;
        this.activeFriendStatus = data.status;
        this.activeFriendAvatar = data.avatar;

        const friend = loggedUser.friends.find((friend: { id: string; }) => friend.id === id);
        if (friend) {
          this.activeFriendMessages = friend.messages;
        } else {
          // Obsłuż przypadek, gdy znajomy o danym id nie został znaleziony
        }
      });
  }

  checkUserID() {
    const path = this.router.url;
    const personID = path.slice(-24);
    this.storeService.setActiveChatID(personID);
    this.findMessages(personID);
  }

  setMessage() {

  }
  sendMessage() {
    // console.log(this.message.length)
    // if (this.message.length <= 0) return;
    const data = {
      yourID: this.loggedUserID,
      personID: this.activeFriendID,
      message: {
        content: this.message,
        sender: 'Self'
      }
    };
    fetch(`${environment.apiURL}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Internal Server Error');
        }
        return response.json();

      })
      .then(data => {
        console.log(data);
        // return data;
      })
      .catch(error => {
        console.error('Internal Server Error:', error);
        throw error;
      });
  }
}
