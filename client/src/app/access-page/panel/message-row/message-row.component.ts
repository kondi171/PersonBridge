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

@Component({
  selector: 'app-message-row',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  providers: [DatePipe],
  templateUrl: './message-row.component.html',
  styleUrls: ['./message-row.component.scss']
})
export class MessageRowComponent implements OnInit, OnDestroy {
  @Input() person!: MessageRow;
  UserStatus = UserStatus;
  formattedDate: string = '';
  isUnread: boolean = false;
  loggedUserSubscription: Subscription;
  chatIDSubscription: Subscription;
  yourID = "";
  chatID = "";
  ChatType = ChatType;

  constructor(private storeService: StoreService, private socketService: SocketService, private datePipe: DatePipe) {
    this.loggedUserSubscription = this.storeService.loggedUser$.subscribe(user => {
      if (user?._id) {
        this.yourID = user._id;
      }
    });
    this.chatIDSubscription = this.storeService.chatID$.subscribe(chatID => {
      this.chatID = chatID;
      if (this.person?.id) {
        if (this.person.id === chatID) {
          this.isUnread = false;
          this.person.lastMessage.read = true;
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
    this.person.avatar = this.ensureFullURL(this.person.avatar) + `?${timestamp}`;
    this.formatDate(new Date(this.person.lastMessage.date));
    this.isUnread = !this.person.lastMessage.read && this.person.lastMessage.sender === this.person.id;

    this.socketService.onStatusChange(() => {
      this.getUserStatus();
    });
    this.socketService.onMarkMessageAsRead((data) => {
      this.handleMarkMessageAsRead(data);
    });

    this.storeService.accessibility$.subscribe(accessibility => {
      if (accessibility[this.person.id]) {
        this.person.accessibility = accessibility[this.person.id];
      }
    });
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

  getUserStatus() {
    fetch(`${environment.apiURL}/access/status/${this.person.id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(response => response.json())
      .then(data => {
        this.person.status = data.status;
      })
  }

  handleMarkMessageAsRead(data: any) {
    if (this.person.id === data.from && this.person.lastMessage.sender === this.yourID) {
      this.person.lastMessage.read = true;
      this.isUnread = false;
    }
  }

  getIcon(): any {
    if (this.person.lastMessage.sender === this.person.id) {
      return this.person.lastMessage.read ? this.icons.oldMessage : this.icons.newMessage;
    } else if (this.person.lastMessage.sender === this.yourID) {
      return this.person.lastMessage.read ? this.icons.readMessage : this.icons.sentMessage;
    }
    return this.icons.systemMessage;
  }

  ensureFullURL(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${environment.serverURL}/${path}`;
  }
}
