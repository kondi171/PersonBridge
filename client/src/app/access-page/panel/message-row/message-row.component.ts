import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MessageRow } from '../../../typescript/interfaces';
import { StoreService } from '../../../services/store.service';
import { UserStatus } from '../../../typescript/enums';
import { environment } from '../../../app.environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-message-row',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './message-row.component.html',
  styleUrl: './message-row.component.scss'
})
export class MessageRowComponent implements OnInit {
  @Input() person!: MessageRow;
  UserStatus = UserStatus;
  read = false;

  constructor() { }

  ngOnInit() {
    const timestamp = new Date().getTime();
    this.person.avatar = this.ensureFullURL(this.person.avatar) + `?${timestamp}`;
  }

  ensureFullURL(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${environment.serverURL}/${path}`;
  }
}

