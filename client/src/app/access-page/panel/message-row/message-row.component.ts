import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MessageRow } from '../../../typescript/interfaces';
import { ChatType, UserStatus } from '../../../typescript/enums';
import { environment } from '../../../app.environment';
import { faBellSlash, faCheck, faCheckDouble, faCircleCheck, faCircleExclamation, faCommentSlash, faExclamation, faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Subscription } from 'rxjs';
import { StoreService } from '../../../services/store.service';
import { SocketService } from '../../../services/socket.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-message-row',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  providers: [DatePipe],
  templateUrl: './message-row.component.html',
  styleUrls: ['./message-row.component.scss'],
  animations: [
    trigger('messageRowAnimation', [
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
export class MessageRowComponent implements OnInit, OnDestroy {
  @Input() messageRow!: MessageRow;
  UserStatus = UserStatus;
  formattedDate: string = '';
  isUnread: boolean = false;
  loggedUserSubscription: Subscription;
  chatIDSubscription: Subscription;
  yourID = "";
  chatID = "";
  ChatType = ChatType;
  onlineParticipantsCount: number = 0;

  constructor(private storeService: StoreService, private socketService: SocketService, private datePipe: DatePipe) {
    this.loggedUserSubscription = this.storeService.loggedUser$.subscribe(user => {
      if (user?._id) {
        this.yourID = user._id;
      }
    });
    this.chatIDSubscription = this.storeService.chatID$.subscribe(chatID => {
      this.chatID = chatID;
      if (this.messageRow?.id) {
        if (this.messageRow.id === chatID) {
          this.isUnread = false;
          this.messageRow.lastMessage.read = true;
        }
      }
    });
  }

  icons = {
    newMessage: faExclamation,
    sentMessage: faCheck,
    readMessage: faCheckDouble,
    oldMessage: faCircleCheck,
    systemMessage: faCircleExclamation,
    mute: faBellSlash,
    ignore: faCommentSlash,
    block: faLock,
  }

  ngOnInit() {
    const timestamp = new Date().getTime();
    this.messageRow.avatar = this.ensureFullURL(this.messageRow.avatar) + `?${timestamp}`;
    this.formatDate(new Date(this.messageRow.lastMessage.date));
    this.setUnreadStatus();

    this.socketService.onStatusChange((data) => {
      this.updateParticipantStatus(data.from);
    });
    this.socketService.onMarkMessageAsRead((data) => {
      this.handleMarkMessageAsRead(data);
    });

    this.storeService.accessibility$.subscribe(accessibility => {
      if (accessibility[this.messageRow.id]) {
        this.messageRow.accessibility = accessibility[this.messageRow.id];
      }
    });

    if (this.messageRow.type === ChatType.GROUP_CHAT) {
      this.updateParticipantsStatus();
    }
  }

  ngOnDestroy() {
    this.loggedUserSubscription.unsubscribe();
    this.chatIDSubscription.unsubscribe();
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
    else if (isCurrentYear) this.formattedDate = `${this.datePipe.transform(date, 'd MMMM')}`;
    else this.formattedDate = `${this.datePipe.transform(date, 'd MMMM yyyy')}`;
  }

  setUnreadStatus() {
    if (this.messageRow.type === ChatType.GROUP_CHAT) {
      this.isUnread = !this.messageRow.lastMessage.read && this.messageRow.lastMessage.sender !== this.yourID;
    } else {
      this.isUnread = !this.messageRow.lastMessage.read && this.messageRow.lastMessage.sender === this.messageRow.id;
    }
  }

  handleMarkMessageAsRead(data: any) {
    if (this.messageRow.id === data.from && this.messageRow.lastMessage.sender === this.yourID) {
      this.messageRow.lastMessage.read = true;
      this.isUnread = false;
    }
  }

  updateParticipantStatus(participantID: string) {
    if (this.messageRow.participants) {
      const participant = this.messageRow.participants.find(p => p.id === participantID);
      if (participant) {
        participant.status = participant.status === UserStatus.ONLINE ? UserStatus.OFFLINE : UserStatus.ONLINE;
        this.updateParticipantsStatus();
      }
    }
  }

  updateParticipantsStatus(): void {
    if (this.messageRow.participants) {
      const participantsExcludingYou = this.messageRow.participants.filter(p => p.id !== this.yourID);
      this.onlineParticipantsCount = participantsExcludingYou.filter(p => p.status === UserStatus.ONLINE).length;
    }
  }

  isAnyParticipantOnline(): boolean {
    return this.onlineParticipantsCount > 0;
  }

  getIcon(): any {
    if (this.messageRow.lastMessage.sender === this.messageRow.id) {
      return this.messageRow.lastMessage.read ? this.icons.oldMessage : this.icons.newMessage;
    } else if (this.messageRow.lastMessage.sender === this.yourID) {
      return this.messageRow.lastMessage.read ? this.icons.readMessage : this.icons.sentMessage;
    }
    return this.icons.systemMessage;
  }

  getParticipantName(senderID: string): string {
    const participant = this.messageRow.participants?.find(p => p.id === senderID);
    return participant ? `${participant.name}: ` : '';
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
