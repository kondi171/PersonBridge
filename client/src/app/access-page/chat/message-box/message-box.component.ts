import { Component, Input, OnInit, OnDestroy, ElementRef, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { StoreService } from '../../../services/store.service';
import { FriendChatData, User, Message } from '../../../typescript/interfaces';
import { environment } from '../../../app.environment';
import { MessageSender } from '../../../typescript/enums';

@Component({
  selector: 'app-message-box',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.scss']
})
export class MessageBoxComponent implements OnInit, OnDestroy {
  @Input() message: Message = {
    id: '',
    content: '',
    date: new Date(),
    sender: MessageSender.YOU,
    read: false,
    reactions: []
  };

  @Input() friendData: FriendChatData = {
    id: '',
    name: '',
    lastname: '',
    status: '',
    avatar: '',
    accessibility: {
      mute: false,
      ignore: false,
      block: false,
    },
    settings: {
      nickname: '',
      PIN: 0,
    },
    blocked: []
  };

  MessageSender = MessageSender;
  loggedUserSubscription: Subscription;
  loggedUser: User | null = null;
  formattedDate: string = '';
  visibleReactions: boolean = false; // Zmienna do kontrolowania widoczności sekcji reakcji

  constructor(private datePipe: DatePipe, private storeService: StoreService, private elementRef: ElementRef) {
    this.loggedUserSubscription = this.storeService.loggedUser$.subscribe(user => {
      this.loggedUser = user;
      if (this.loggedUser?.avatar) {
        const timestamp = new Date().getTime();
        this.loggedUser.avatar = this.ensureFullURL(this.loggedUser.avatar) + `?${timestamp}`;
      }
    });
  }

  ngOnInit(): void {
    this.formatDate(this.message.date);
    console.log(this.message)
  }

  ngOnDestroy(): void {
    this.loggedUserSubscription.unsubscribe();
  }

  formatDate(date: Date): void {
    const today = new Date();
    const currentYear = today.getFullYear();

    const inputDate = new Date(date.getTime());
    const inputYear = inputDate.getFullYear();

    inputDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const isToday = inputDate.getTime() === today.getTime();

    const isCurrentYear = inputYear === currentYear;

    if (isToday) this.formattedDate = `${this.datePipe.transform(date, 'HH:mm')}`;
    else if (isCurrentYear) this.formattedDate = `${this.datePipe.transform(date, 'd MMMM, HH:mm')}`;
    else this.formattedDate = `${this.datePipe.transform(date, 'd MMMM yyyy, HH:mm')}`;
  }

  ensureFullURL(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${environment.serverURL}/${path}`;
  }

  formatMessageContent(content: string): string {
    return content.replace(/\n/g, '<br>');
  }

  toggleReactionsVisibility(): void {
    this.visibleReactions = !this.visibleReactions;
  }

  handleAddReaction(emoticon: string): void {
    const reaction = {
      userID: this.loggedUser?._id || '',
      emoticon: emoticon
    };
    fetch(`${environment.apiURL}/chat/reaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ yourID: this.loggedUser?._id, friendID: this.friendData.id, messageID: this.message.id, reaction })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Reaction didn't send!");
        }
        return response.json();
      })
      .then((data) => {
        // Tu można dodać logikę odświeżania wiadomości lub inne działania po udanej reakcji
      })
      .catch(error => {
        console.error("Reaction didn't send!:", error);
      });
    this.visibleReactions = !this.visibleReactions;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    const targetElement = event.target as HTMLElement;
    if (this.visibleReactions && !this.elementRef.nativeElement.contains(targetElement)) {
      this.visibleReactions = false;
    }
  }
}
