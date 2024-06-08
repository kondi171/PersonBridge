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
import { User, Message, ChatbotChatData } from '../../../typescript/interfaces';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { SocketService } from '../../../services/socket.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { AudioService } from '../../../services/audio.service';
import { ChatType } from '../../../typescript/enums';
import { BotPINComponent } from './bot-pin/bot-pin.component';

@Component({
  selector: 'app-bot-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, RouterModule, PickerComponent, MessageBoxComponent, NoMessagesComponent, BotPINComponent],
  templateUrl: './bot-chat.component.html',
  styleUrls: ['./bot-chat.component.scss'],
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
export class BotChatComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('messagesContainer') private messageContainer!: ElementRef;
  @ViewChild('emojiPicker') emojiPicker!: ElementRef;
  ChatType = ChatType;
  loggedUserSubscription: Subscription;
  chatID = "";
  messageContent = "";
  showEmojiPicker = false;
  icons = {
    audio: faPhone,
    video: faVideoCamera,
    settings: faEllipsisV,
    emoticons: faSmile,
    back: faChevronLeft,
    send: faPaperPlane
  }
  limit = 20;
  offset = 0;
  chatbotChatData: ChatbotChatData = {
    id: '',
    name: '',
    founder: '',
    description: '',
    settings: {
      nickname: '',
      PIN: 0
    },
    modelAPI: '',
    messages: []
  }
  messages: Message[] = [];
  yourID = '';
  loggedUser: User | null = null;
  private initialized = false;
  accessGranted = false;
  visibleReactions: { [key: string]: boolean } = {};
  isInitialized = false;
  constructor(private storeService: StoreService, private socketService: SocketService, private toastr: ToastrService, private cdr: ChangeDetectorRef, private router: Router, private audioService: AudioService) {
    this.loggedUserSubscription = this.storeService.loggedUser$.subscribe(user => {
      this.loggedUser = user;
      if (this.loggedUser?._id) {
        this.yourID = this.loggedUser._id;
      }
    });
  }

  ngOnInit(): void {
    const url = this.router.url;
    const lastPart = url.split('/').pop();
    this.chatID = String(lastPart);
    this.getMessages(false, true);
  }

  ngOnDestroy(): void {
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

  getMessages(loadMore = false, scrollDown = false, dynamicLimit?: number) {
    if (!loadMore) {
      this.offset = 0;
    }
    if (this.chatID.length !== 24) return;
    const limitToUse = dynamicLimit || this.limit;
    fetch(`${environment.apiURL}/bot/chat/${this.yourID}/${this.chatID}?limit=${limitToUse}&offset=${this.offset}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Retrieving chatbot failed');
        }
        return response.json();
      })
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
        const { id, name, founder, description, modelAPI, settings } = data.chatbot;
        this.chatbotChatData = {
          id: id,
          name: name,
          founder: founder,
          description: description,
          settings: settings,
          modelAPI: modelAPI,
          messages: data.messages
        }
        if (this.chatbotChatData.settings.PIN === 0) {
          this.accessGranted = true;
        }
        this.isInitialized = true;
        this.cdr.detectChanges();
        this.scrollToBottom();
      })
      .catch(error => {
        this.toastr.error('An Error Occured while retrieving chatbot!', 'Chatbot Error');
        this.audioService.playErrorSound();
        console.error('chatbot Error:', error);
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

  sendMessage(): void {
    if (!this.accessGranted) {
      this.toastr.error('You need to enter the correct PIN!', 'Access Denied');
      this.audioService.playErrorSound();
      return;
    }
    if (this.messageContent.trim()) {
      const currentMessage = this.messageContent.trim();
      fetch(`${environment.apiURL}/bot/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ yourID: this.yourID, chatbotID: this.chatID, message: currentMessage })
      })
        .then(response => response.json())
        .then(() => {
          this.getMessages(false, true, this.messages.length >= this.limit ? this.limit + 1 : this.limit);
          // const recentMessages = this.messages
          //   .filter(msg => msg.sender === this.yourID)
          //   .slice(-4) 
          //   .map(msg => msg.content);
          // recentMessages.push(currentMessage); 

          this.getBotReply(this.messageContent);
          this.messageContent = '';
        })
        .catch(error => {
          this.toastr.error('An Error Occured while sending message!', 'Message Error');
          this.audioService.playErrorSound();
          console.error('Error occur while communicating with chatbot:', error);
        });
    }
  }

  getBotReply(recentMessage: string) {
    fetch(`${environment.apiURL}/bot/chat/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        yourID: this.yourID,
        chatbotID: this.chatID,
        chatbotModel: this.chatbotChatData.name,
        message: recentMessage,
        modelAPI: this.chatbotChatData.modelAPI
      })
    })
      .then(response => response.json())
      .then((data) => {
        if (data.error) {
          this.toastr.error('Failed to get response from chatbot', 'Chatbot Error');
          this.audioService.playErrorSound();
        } else {
          this.getMessages(false, true, this.messages.length >= this.limit ? this.limit + 1 : this.limit);
        }
        // console.log(data)
      })
      .catch(error => {
        this.toastr.error('An Error Occured while communicating with chatbot!', 'Chatbot Error');
        this.audioService.playErrorSound();
        console.error('Error occur while communicating with chatbot:', error);
      });
  }

  loadMoreMessages() {
    this.getMessages(true, false);
  }

  onAccessGranted(granted: boolean) {
    this.accessGranted = granted;
    this.cdr.detectChanges();
  }

  // regenerateAnswer(message: Message): void {
  //   this.getBotReply(message.content);
  // }

  navigateToSettings() {
    if (this.accessGranted) {
      this.router.navigate(['/access/chat/bot', this.chatbotChatData.id, 'settings']);
      this.audioService.playChangeStateSound();
    } else {
      this.toastr.error('You need to enter the correct PIN to access settings!', 'Access Denied');
      this.audioService.playErrorSound();
    }
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const targetElement = event.target as HTMLElement;
    if (this.showEmojiPicker && !targetElement.closest('.input-container__icon') && !targetElement.closest('emoji-mart')) {
      this.showEmojiPicker = false;
      this.cdr.detectChanges();
    }
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
