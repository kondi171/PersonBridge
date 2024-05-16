import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../../../typescript/types';
import { StoreService } from '../../../services/store.service';
import { Subscription } from 'rxjs';
import { User } from '../../../typescript/interfaces';
import { environment } from '../../../app.environment';
@Component({
  selector: 'app-message-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-box.component.html',
  styleUrl: './message-box.component.scss'
})
export class MessageBoxComponent {

  @Input() message: Message = {
    content: '',
    date: '',
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
  }

  loggedUserSubscription: Subscription;
  loggedUser: User | null = null;

  constructor(private storeService: StoreService) {
    this.loggedUserSubscription = this.storeService.loggedUser$.subscribe(user => {
      this.loggedUser = user;
      if (this.loggedUser?.avatar) {
        const timestamp = new Date().getTime();
        this.loggedUser.avatar = this.ensureFullURL(this.loggedUser.avatar) + `?${timestamp}`;
      }
    });
  }
  ensureFullURL(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${environment.serverURL}/${path}`;
  }
}
