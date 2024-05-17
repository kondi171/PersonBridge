import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MessageRow } from '../../../typescript/types';
import { MessageSender, UserStatus } from '../../../typescript/enums';
import { environment } from '../../../app.environment';
import { faCheck, faExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-message-row',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  providers: [DatePipe],
  templateUrl: './message-row.component.html',
  styleUrl: './message-row.component.scss'
})
export class MessageRowComponent implements OnInit {
  @Input() person!: MessageRow;
  UserStatus = UserStatus;
  MessageSender = MessageSender;
  read = false;
  formattedDate: string = '';
  constructor(private datePipe: DatePipe) { }
  icons = {
    newMessage: faExclamation,
    sentMessage: faCheck,
  }
  ngOnInit() {
    const timestamp = new Date().getTime();
    this.person.avatar = this.ensureFullURL(this.person.avatar) + `?${timestamp}`;
    const lastMessageDate = new Date(this.person.lastMessage.date);
    this.formatDate(lastMessageDate);
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

  ensureFullURL(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${environment.serverURL}/${path}`;
  }
}

