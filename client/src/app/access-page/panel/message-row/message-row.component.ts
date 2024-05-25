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
  yourID = "";
  ChatType = ChatType;

  constructor(private storeService: StoreService, private datePipe: DatePipe) {
    this.loggedUserSubscription = this.storeService.loggedUser$.subscribe(user => {
      if (user?._id) {
        this.yourID = user._id;
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
    // console.log(this.person)
  }

  ngOnDestroy() {
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
    else if (isCurrentYear) this.formattedDate = `${this.datePipe.transform(date, 'd MMMM')}`;
    else this.formattedDate = `${this.datePipe.transform(date, 'd MMMM yyyy')}`;
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
