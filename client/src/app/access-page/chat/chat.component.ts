import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEllipsisV, faVideoCamera, faPhone, faSmile, faChevronLeft, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { MessageBoxComponent } from './message-box/message-box.component';
import { RouterModule } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../app.environment';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NoMessagesComponent } from './no-messages/no-messages.component';
import { ToastrService } from 'ngx-toastr';
import { UserStatus } from '../../typescript/enums';
import { Message } from '../../typescript/types';
import { User } from '../../typescript/interfaces';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, RouterModule, MessageBoxComponent, NoMessagesComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnDestroy, AfterViewInit {
  @ViewChild('messagesContainer') private messageContainer!: ElementRef;

  UserStatus = UserStatus;
  loggedUserSubscription: Subscription;
  chatIDSubscription: Subscription;
  chatID = "";
  noMessages: boolean = true;
  messageContent = "";
  icons = {
    audio: faPhone,
    video: faVideoCamera,
    settings: faEllipsisV,
    emoticons: faSmile,
    back: faChevronLeft,
    send: faPaperPlane
  }

  friendChatData = {
    id: "",
    name: "",
    lastname: "",
    avatar: "",
    status: "",
    settings: {
      nickname: '',
      PIN: 0,
    }
  }
  yourID = '';
  loggedUser: User | null = null;
  messages: Message[] = [];
  private initialized = false;

  constructor(private storeService: StoreService, private toastr: ToastrService, private cdr: ChangeDetectorRef) {
    this.loggedUserSubscription = this.storeService.loggedUser$.subscribe(user => {
      this.loggedUser = user;
      if (this.loggedUser?._id) {
        this.yourID = this.loggedUser._id;
      }
    });
    this.chatIDSubscription = this.storeService.chatID$.subscribe(chatID => {
      this.chatID = chatID;
      if (this.chatID === 'no-messages') this.noMessages = true;
      else if (this.chatID !== '') {
        this.noMessages = false;
        this.getMessages();
      } else this.noMessages = false;
    });
  }

  ngOnDestroy(): void {
    this.chatIDSubscription.unsubscribe();
    this.loggedUserSubscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.initialized = true;
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      if (this.messageContainer) {
        setTimeout(() => {
          this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
        }, 0);
      }
    } catch (err) {
      console.error('Scroll to bottom failed:', err);
    }
  }

  getMessages() {
    fetch(`${environment.apiURL}/chat/${this.yourID}/${this.chatID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data.messages.length !== 0) {
          this.messages = data.messages.map((message: Message) => ({
            ...message,
            date: new Date(message.date)
          }));
        }
        this.friendChatData = data.friend;
        const timestamp = new Date().getTime();
        this.friendChatData.avatar = this.ensureFullURL(data.friend.avatar) + `?${timestamp}`;
        this.cdr.detectChanges();
        if (this.initialized) {
          this.scrollToBottom();
        }
      })
      .catch(error => {
        this.toastr.error('An Error Occured while fetching friend!', 'Data Retrieve Error');
        console.error('Data Retrieve Error:', error);
      });
  }

  sendMessage() {
    if (this.messageContent === '') return;
    fetch(`${environment.apiURL}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ yourID: this.yourID, friendID: this.friendChatData.id, message: this.messageContent })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Message doesn't sent!");
        }
        return response.json();
      })
      .then(() => {
        this.messageContent = '';
        this.getMessages();
      })
      .catch(error => {
        this.toastr.error('An Error Occured while sending message!', 'Message Error');
        console.error("Message doesn't sent!:", error);
      });
  }

  ensureFullURL(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${environment.serverURL}/${path}`;
  }
}
