import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, HostListener, Input } from '@angular/core';
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
import { PINComponent } from '../pin/pin.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-group-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, RouterModule, PickerComponent, MessageBoxComponent, NoMessagesComponent, PINComponent],
  templateUrl: './group-chat.component.html',
  styleUrls: ['./group-chat.component.scss']
})
export class GroupChatComponent implements OnDestroy, AfterViewInit {
  @ViewChild('messagesContainer') private messageContainer!: ElementRef;
  @ViewChild('emojiPicker') emojiPicker!: ElementRef;
  @Input() chatType = ChatType.GROUP_CHAT;
  UserStatus = UserStatus;
  loggedUserSubscription: Subscription;
  chatIDSubscription: Subscription;
  chatID = "";
  noMessages: boolean = true;
  messageContent = "";
  messageContents: { [key: string]: string } = {}; // Obiekt do przechowywania zawartości inputa dla każdego czatu
  accessGranted = false;
  limit = 20;
  offset = 0;
  showEmojiPicker = false; // Nowa zmienna do kontrolowania widoczności kontenera z emotikonami
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
  visibleReactions: { [key: string]: boolean } = {};

  constructor(private storeService: StoreService, private toastr: ToastrService, private cdr: ChangeDetectorRef, private router: Router) {
    this.loggedUserSubscription = this.storeService.loggedUser$.subscribe(user => {
      this.loggedUser = user;
      if (this.loggedUser?._id) {
        this.yourID = this.loggedUser._id;
      }
    });
    this.chatIDSubscription = this.storeService.chatID$.subscribe(chatID => {
      this.saveCurrentMessageContent(); // Zapisz aktualną zawartość inputa przed zmianą czatu
      this.chatID = chatID;
      if (this.chatID === 'no-messages') {
        this.noMessages = true;
      } else if (this.chatID !== '') {
        this.noMessages = false;
        this.accessGranted = false; // Resetowanie accessGranted przy zmianie chatID
        this.messages = []; // Resetowanie wiadomości przy zmianie chatID
        this.offset = 0; // Resetowanie offsetu przy zmianie chatID
        this.messageContent = this.getMessageContent(); // Przywrócenie zawartości inputa dla aktualnego czatu
        this.getMessages(false, true); // Przewijanie tylko przy pierwszym ładowaniu wiadomości
      } else {
        this.noMessages = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.chatIDSubscription.unsubscribe();
    this.loggedUserSubscription.unsubscribe();
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
    // console.log(this.activeChatType)
    // if (this.activeChatType === ChatType.USER_CHAT) return;
    if (!loadMore) {
      this.offset = 0;
    }
    fetch(`${environment.apiURL}/chat/group/${this.yourID}/${this.chatID}?limit=${this.limit}&offset=${this.offset}`, {
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
            date: new Date(message.date), // Konwertuj date na obiekt Date
          }));
          this.messages = loadMore ? [...formattedMessages, ...this.messages] : formattedMessages;
          this.offset += this.limit; // Zwiększ offset tylko jeśli załadowano więcej wiadomości
          if (loadMore) {
            this.toastr.success('Loaded more messages.', 'Success');
          }
        } else {
          if (loadMore) {
            this.toastr.info('No more messages to load.', 'Info');
          }
        }
        this.groupChatData = data;
        // console.log(this.groupChatData)
        if (this.groupChatData.PIN === 0) {
          this.accessGranted = true;
        }
        const timestamp = new Date().getTime();
        this.groupChatData.avatar = this.ensureFullURL(data.avatar) + `?${timestamp}`;
        this.groupChatData.messages = this.messages;
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
    if (!this.accessGranted) {
      this.toastr.error('You need to enter the correct PIN!', 'Access Denied');
      return;
    }

    if (this.messageContent.trim() === '') return;

    fetch(`${environment.apiURL}/chat/group/message`, {
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

  onAccessGranted(granted: boolean) {
    this.accessGranted = granted;
    this.cdr.detectChanges();
  }

  navigateToSettings() {
    if (this.accessGranted) {
      this.router.navigate(['/access/chat', this.groupChatData.id, 'settings']);
    } else {
      this.toastr.error('You need to enter the correct PIN to access settings!', 'Access Denied');
    }
  }

  handleAudioCall() {
    if (this.accessGranted) {
      // Audio Call
    } else {
      this.toastr.error('You need to enter the correct PIN!', 'Access Denied');
    }
  }

  handleVideoCall() {
    if (this.accessGranted) {
      // Video Call
    } else {
      this.toastr.error('You need to enter the correct PIN!', 'Access Denied');
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
