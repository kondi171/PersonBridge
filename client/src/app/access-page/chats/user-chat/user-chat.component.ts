import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, HostListener } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEllipsisV, faVideoCamera, faPhone, faSmile, faChevronLeft, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { MessageBoxComponent } from '../message-box/message-box.component';
import { RouterModule } from '@angular/router';
import { StoreService } from '../../../services/store.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../app.environment';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NoMessagesComponent } from '../no-messages/no-messages.component';
import { ToastrService } from 'ngx-toastr';
import { ChatType, UserStatus } from '../../../typescript/enums';
import { FriendChatData, User, Message } from '../../../typescript/interfaces';
import { PINComponent } from './pin/pin.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { SocketService } from '../../../services/socket.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { AudioService } from '../../../services/audio.service';

@Component({
  selector: 'app-user-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, RouterModule, PickerComponent, MessageBoxComponent, NoMessagesComponent, PINComponent],
  templateUrl: './user-chat.component.html',
  styleUrls: ['./user-chat.component.scss'],
  animations: [
    trigger('messageAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('500ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('500ms ease-in', style({ transform: 'translateY(20px)', opacity: 0 }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-in', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class UserChatComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('messagesContainer') private messageContainer!: ElementRef;
  @ViewChild('emojiPicker') emojiPicker!: ElementRef;

  UserStatus = UserStatus;
  loggedUserSubscription: Subscription;
  chatIDSubscription: Subscription;
  chatTypeSubscription: Subscription;
  forceRefreshMessagesInPanel: Subscription;
  chatID = "";
  noMessages: boolean = true;
  messageContent = "";
  messageContents: { [key: string]: string } = {};
  accessGranted = false;
  limit = 20;
  offset = 0;
  showEmojiPicker = false;
  icons = {
    audio: faPhone,
    video: faVideoCamera,
    settings: faEllipsisV,
    emoticons: faSmile,
    back: faChevronLeft,
    send: faPaperPlane
  }
  activeChatType = ChatType.USER_CHAT;


  friendChatData: FriendChatData = {
    id: "",
    name: "",
    lastname: "",
    avatar: "",
    status: UserStatus.OFFLINE,
    accessibility: {
      mute: false,
      ignore: false,
      block: false
    },
    settings: {
      nickname: '',
      PIN: 0,
    },
    blocked: []
  }
  ChatType = ChatType;
  yourID = '';
  loggedUser: User | null = null;
  messages: Message[] = [];
  private initialized = false;
  forceMessages: boolean = false;
  visibleReactions: { [key: string]: boolean } = {};
  isInitialized: boolean = false;

  constructor(private storeService: StoreService, private socketService: SocketService, private toastr: ToastrService, private cdr: ChangeDetectorRef, private router: Router, private audioService: AudioService) {
    this.loggedUserSubscription = this.storeService.loggedUser$.subscribe(user => {
      this.loggedUser = user;
      if (this.loggedUser?._id) {
        this.yourID = this.loggedUser._id;
      }
    });
    this.chatIDSubscription = this.storeService.chatID$.subscribe(chatID => {
      this.saveCurrentMessageContent();
      this.chatID = chatID;
      this.isInitialized = false;
      if (this.chatID === 'no-messages') {
        this.noMessages = true;
      } else if (this.chatID !== '') {
        this.noMessages = false;
        this.accessGranted = false;
        this.messages = [];
        this.offset = 0;
        this.messageContent = this.getMessageContent();
        this.getMessages(false, true);
      } else {
        this.noMessages = false;
      }
    });
    this.chatTypeSubscription = this.storeService.chatType$.subscribe(chatType => {
      this.activeChatType = chatType;
    });

    this.forceRefreshMessagesInPanel = this.storeService.refreshMessages$.subscribe(force => {
      this.forceMessages = force;
      if (this.forceMessages) {
        this.getMessages(false, true);
        this.storeService.forceRefreshMessages(false);
      }
    });
  }

  ngOnInit(): void {
    this.socketService.onStatusChange(() => {
      this.getUserStatus();
    });

    this.socketService.onMessageToUserSent((data: any) => {
      if (data.from === this.friendChatData.id) {
        if (!this.friendChatData.accessibility.mute)
          this.audioService.playNewMessageSound();
        this.getMessages(false, true);
      }
    });
    this.socketService.onAddReactionToUser(() => {
      this.getMessages(false, true);
      this.storeService.forceRefreshMessages(true);
    });
  }

  ngOnDestroy(): void {
    this.chatIDSubscription.unsubscribe();
    this.loggedUserSubscription.unsubscribe();
    this.chatTypeSubscription.unsubscribe();
    this.forceRefreshMessagesInPanel.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.initialized = true;
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

  private saveCurrentMessageContent() {
    if (this.chatID) {
      this.messageContents[this.chatID] = this.messageContent;
    }
  }

  private getMessageContent(): string {
    return this.messageContents[this.chatID] || '';
  }

  getMessages(loadMore = false, scrollDown = false, dynamicLimit?: number) {
    if (!loadMore) {
      this.offset = 0;
    }
    if (this.chatID.length !== 24) return;
    const limitToUse = dynamicLimit || this.limit;
    fetch(`${environment.apiURL}/user/chat/${this.yourID}/${this.chatID}?limit=${limitToUse}&offset=${this.offset}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data.messages.length !== 0) {
          const formattedMessages = data.messages.map((message: Message) => ({
            ...message,
            date: new Date(message.date),
          }));
          if (loadMore) {
            this.messages = [...formattedMessages, ...this.messages];
            this.toastr.success('Loaded more messages.', 'Success');
            this.audioService.playSuccessSound();
          } else {
            this.messages = formattedMessages.slice(-limitToUse);
          }
          this.offset += limitToUse;
        } else {
          if (loadMore) {
            this.toastr.info('No more messages to load.', 'Info');
          }
        }
        this.friendChatData = data.friend;
        if (this.friendChatData.settings.PIN === 0) {
          this.accessGranted = true;
        }
        const timestamp = new Date().getTime();
        this.friendChatData.avatar = this.ensureFullURL(data.friend.avatar) + `?${timestamp}`;
        this.cdr.detectChanges();
        if (scrollDown && this.initialized) {
          this.scrollToBottom();
        }
        this.isInitialized = true;
      })
      .catch(error => {
        this.toastr.error('An Error Occured while fetching friend!', 'Data Retrieve Error');
        this.audioService.playErrorSound();
        console.error('Data Retrieve Error:', error);
      });
    this.markMessagesAsRead();
  }

  getUserStatus() {
    fetch(`${environment.apiURL}/access/status/${this.friendChatData.id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(response => response.json())
      .then(data => {
        this.friendChatData.status = data.status;
      })
  }

  markMessagesAsRead() {
    if (this.chatID.length !== 24) return;
    fetch(`${environment.apiURL}/user/chat/mark`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ yourID: this.yourID, friendID: this.chatID })
    })
      .catch(error => {
        this.toastr.error('An Error Occured while marking message!', 'Message Error');
        this.audioService.playErrorSound();
        console.error('Data Retrieve Error:', error);
      });
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      if (event.shiftKey) return;
      else {
        event.preventDefault();
        this.sendMessage();
      }
    }
  }

  sendMessage() {
    if (!this.accessGranted) {
      this.toastr.error('You need to enter the correct PIN!', 'Access Denied');
      this.audioService.playErrorSound();
      return;
    }

    if (this.messageContent.trim() === '') return;

    if (this.friendChatData.accessibility.block) {
      this.toastr.error('Friend is blocked!', `${this.friendChatData.name} ${this.friendChatData.lastname}`);
      this.audioService.playErrorSound();
      return;
    }

    if (this.friendChatData.blocked.includes(this.yourID)) {
      this.toastr.error('Friend is blocking you!', `${this.friendChatData.name} ${this.friendChatData.lastname}`);
      this.audioService.playErrorSound();
      return;
    }

    if (this.friendChatData.accessibility.ignore) {
      this.toastr.warning("The message has been sent, but you will not receive a reply.", `You ignore ${this.friendChatData.name} ${this.friendChatData.lastname}`);
    }

    fetch(`${environment.apiURL}/user/chat/message`, {
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
        this.getMessages(false, true, this.messages.length >= this.limit ? this.limit + 1 : this.limit);
        this.storeService.notifyNewMessage();
      })
      .catch(error => {
        this.toastr.error('An Error Occured while sending message!', 'Message Error');
        this.audioService.playErrorSound();
        console.error("Message doesn't sent!:", error);
      });
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const targetElement = event.target as HTMLElement;
    if (this.showEmojiPicker && !targetElement.closest('.input-container__icon') && !targetElement.closest('emoji-mart')) {
      this.showEmojiPicker = false;
      this.cdr.detectChanges();
    }
  }

  onAccessGranted(granted: boolean) {
    this.accessGranted = granted;
    this.cdr.detectChanges();
  }

  navigateToSettings() {
    if (this.accessGranted) {
      this.router.navigate(['/access/chat/user', this.friendChatData.id, 'settings']);
      this.audioService.playChangeStateSound();
    } else {
      this.toastr.error('You need to enter the correct PIN to access settings!', 'Access Denied');
      this.audioService.playErrorSound();
    }
  }

  handleAudioCall() {
    if (this.accessGranted) {
      // Audio Call
    } else {
      this.toastr.error('You need to enter the correct PIN!', 'Access Denied');
      this.audioService.playErrorSound();
    }
  }

  handleVideoCall() {
    if (this.accessGranted) {
      // Video Call
    } else {
      this.toastr.error('You need to enter the correct PIN!', 'Access Denied');
      this.audioService.playErrorSound();
    }
  }

  loadMoreMessages() {
    this.getMessages(true, false);
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any) {
    const text = `${this.messageContent}${event.emoji.native}`;
    this.messageContent = text;
  }

  onImageError(event: any) {
    event.target.src = './../../../../assets/img/Blank-Avatar.jpg';
  }

  ensureFullURL(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${environment.serverURL}/${path}`;
  }
}
