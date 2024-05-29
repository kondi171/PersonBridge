import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, HostListener, Input, OnInit } from '@angular/core';
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
import { GroupChatData, User, Message } from '../../../typescript/interfaces';
import { PINComponent } from '../user-chat/pin/pin.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { animate, style, transition, trigger } from '@angular/animations';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-group-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, RouterModule, PickerComponent, MessageBoxComponent, NoMessagesComponent, PINComponent],
  templateUrl: './group-chat.component.html',
  styleUrls: ['./group-chat.component.scss'],
  animations: [
    trigger('messageAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('500ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('500ms ease-in', style({ transform: 'translateY(20px)', opacity: 0 }))
      ])
    ])
  ]
})
export class GroupChatComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('messagesContainer') private messageContainer!: ElementRef;
  @ViewChild('emojiPicker') emojiPicker!: ElementRef;
  @Input() chatType = ChatType.GROUP_CHAT;

  UserStatus = UserStatus;
  loggedUserSubscription: Subscription;
  chatIDSubscription: Subscription;
  forceRefreshMessagesInPanel: Subscription;

  chatID = "";
  noMessages: boolean = true;
  messageContent = "";
  messageContents: { [key: string]: string } = {};
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
  groupChatData: GroupChatData = {
    id: '',
    name: '',
    avatar: '',
    administrator: '',
    status: UserStatus.ONLINE,
    PIN: 0,
    participants: [],
    accessibility: {
      mute: false,
      ignore: false
    },
    messages: []
  }
  ChatType = ChatType;

  yourID = '';
  loggedUser: User | null = null;
  messages: Message[] = [];
  private initialized = false;
  forceMessages: boolean = false;
  visibleReactions: { [key: string]: boolean } = {};
  onlineParticipantsCount: number = 0;

  constructor(private storeService: StoreService, private socketService: SocketService, private toastr: ToastrService, private cdr: ChangeDetectorRef, private router: Router) {
    this.loggedUserSubscription = this.storeService.loggedUser$.subscribe(user => {
      this.loggedUser = user;
      if (this.loggedUser?._id) {
        this.yourID = this.loggedUser._id;
      }
    });
    this.chatIDSubscription = this.storeService.chatID$.subscribe(chatID => {
      this.saveCurrentMessageContent();
      this.chatID = chatID;
      if (this.chatID === 'no-messages') {
        this.noMessages = true;
      } else if (this.chatID !== '') {
        this.noMessages = false;
        this.messages = [];
        this.offset = 0;
        this.messageContent = this.getMessageContent();
        this.getMessages(false, true);
      } else {
        this.noMessages = false;
      }
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
    this.socketService.onStatusChange(data => {
      this.checkParticipantStatuses(data.from);
    });

    this.socketService.onMessageToGroupSent((data: any) => {
      this.getMessages(false, true);
    });
    this.socketService.onAddReactionToGroup(() => {
      this.storeService.forceRefreshMessages(true);
    });
  }

  ngOnDestroy(): void {
    this.chatIDSubscription.unsubscribe();
    this.loggedUserSubscription.unsubscribe();
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

  getMessages(loadMore = false, scrollDown = false) {
    if (!loadMore) {
      this.offset = 0;
    }
    if (this.chatID.length === 24) return;
    fetch(`${environment.apiURL}/group/chat/${this.yourID}/${this.chatID}?limit=${this.limit}&offset=${this.offset}`, {
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
          this.messages = loadMore ? [...formattedMessages, ...this.messages] : formattedMessages;
          this.offset += this.limit;
          if (loadMore) {
            this.toastr.success('Loaded more messages.', 'Success');
          }
        } else {
          if (loadMore) {
            this.toastr.info('No more messages to load.', 'Info');
          }
        }
        this.groupChatData = data;
        const timestamp = new Date().getTime();
        this.groupChatData.avatar = this.ensureFullURL(data.avatar) + `?${timestamp}`;
        this.groupChatData.messages = this.messages;
        this.checkParticipantStatuses(this.yourID);
        this.cdr.detectChanges();
        if (scrollDown && this.initialized) {
          this.scrollToBottom();
        }
      })
      .catch(error => {
        this.toastr.error('An Error Occured while fetching group!', 'Data Retrieve Error');
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
    if (this.messageContent.trim() === '') return;

    fetch(`${environment.apiURL}/group/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ yourID: this.yourID, groupID: this.groupChatData.id, message: this.messageContent })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Message doesn't sent!");
        }
        return response.json();
      })
      .then(() => {
        this.messageContent = '';
        this.getMessages(false, true);
        this.storeService.notifyNewMessage();
      })
      .catch(error => {
        this.toastr.error('An Error Occured while sending message!', 'Message Error');
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

  navigateToSettings() {
    this.router.navigate(['/access/chat/group', this.groupChatData.id, 'settings']);
  }

  handleAudioCall() {
    // Audio Call
  }

  handleVideoCall() {
    // Video Call
  }

  checkParticipantStatuses(userID: string) {
    this.groupChatData.participants.forEach(participant => {
      if (participant.id === userID) {
        if (participant.status === UserStatus.OFFLINE) participant.status = UserStatus.ONLINE;
        else participant.status = UserStatus.OFFLINE;
      }
    });
    const participantsOnline = this.groupChatData.participants.filter(participant => participant.status === UserStatus.ONLINE);
    this.onlineParticipantsCount = participantsOnline.length;
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
