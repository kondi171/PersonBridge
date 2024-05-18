import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MessageRow } from '../../../typescript/interfaces';
import { MessageSender, UserStatus } from '../../../typescript/enums';
import { environment } from '../../../app.environment';
import { faBellSlash, faCheck, faCheckDouble, faCircleCheck, faCircleExclamation, faCommentSlash, faExclamation, faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-message-row',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  providers: [DatePipe],
  templateUrl: './message-row.component.html',
  styleUrls: ['./message-row.component.scss']
})
export class MessageRowComponent implements OnInit {
  @Input() person!: MessageRow;
  UserStatus = UserStatus;
  MessageSender = MessageSender;
  formattedDate: string = '';
  isFriendLastMessage: boolean = false;
  isUnread: boolean = false;

  constructor(private datePipe: DatePipe) { }

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
    const lastMessageDate = this.getLastMessageDate();
    this.formatDate(new Date(lastMessageDate));

    this.isFriendLastMessage = this.checkIsFriendLastMessage();
    this.isUnread = this.checkIsUnread();
  }

  getLastMessageDate(): Date {
    const dateYou = this.person.lastMessage.you?.date ? new Date(this.person.lastMessage.you.date) : new Date(0);
    const dateFriend = this.person.lastMessage.friend?.date ? new Date(this.person.lastMessage.friend.date) : new Date(0);
    return dateYou > dateFriend ? dateYou : dateFriend;
  }

  checkIsFriendLastMessage(): boolean {
    const dateYou = this.person.lastMessage.you?.date ? new Date(this.person.lastMessage.you.date) : new Date(0);
    const dateFriend = this.person.lastMessage.friend?.date ? new Date(this.person.lastMessage.friend.date) : new Date(0);
    return dateFriend > dateYou;
  }

  checkIsUnread(): boolean {
    const dateYou = this.person.lastMessage.you?.date ? new Date(this.person.lastMessage.you.date) : new Date(0);
    const dateFriend = this.person.lastMessage.friend?.date ? new Date(this.person.lastMessage.friend.date) : new Date(0);
    return this.person.lastMessage.friend && !this.person.lastMessage.friend.read && dateFriend >= dateYou;
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
    const lastMessageYou = this.person.lastMessage.you;
    const lastMessageFriend = this.person.lastMessage.friend;
    if (lastMessageFriend && (!lastMessageYou || new Date(lastMessageFriend.date) > new Date(lastMessageYou.date))) {
      return lastMessageFriend.read ? this.icons.oldMessage : this.icons.newMessage;
    }
    if (lastMessageYou) {
      return lastMessageYou.read ? this.icons.readMessage : this.icons.sentMessage;
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
