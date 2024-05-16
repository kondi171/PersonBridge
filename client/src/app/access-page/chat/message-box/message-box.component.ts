import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Message } from '../../../typescript/types';
import { StoreService } from '../../../services/store.service';
import { Subscription } from 'rxjs';
import { User } from '../../../typescript/interfaces';
import { environment } from '../../../app.environment';
@Component({
  selector: 'app-message-box',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.scss']
})
export class MessageBoxComponent implements OnInit {
  @Input() message: {
    content: string;
    date: Date;
    sender: string;
  } = {
      content: '',
      date: new Date(),
      sender: ''
    };
  @Input() friendData = {
    id: '',
    name: '',
    lastname: '',
    status: '',
    avatar: '',
    settings: {
      nickname: '',
      PIN: 0,
    }
  };

  loggedUserSubscription: Subscription;
  loggedUser: User | null = null;
  formattedDate: string = '';

  constructor(private datePipe: DatePipe, private storeService: StoreService) {
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
}