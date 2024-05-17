import { Component, Input, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { MessageRowComponent } from './message-row/message-row.component';
import { map, Observable, Subscription } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from "../../features/navbar/navbar.component";
import { Device } from '../../typescript/enums';
import { CommonModule, DatePipe } from '@angular/common';
import { StoreService } from '../../services/store.service';
import { User } from '../../typescript/interfaces';
import { MessageRow } from '../../typescript/types';
import { environment } from '../../app.environment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-panel',
  standalone: true,
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
  imports: [
    CommonModule,
    MessageRowComponent,
    FontAwesomeModule,
    RouterModule,
    NavbarComponent
  ]
})
export class PanelComponent implements OnInit {
  @Input() device: Device = Device.DESKTOP;

  loggedUserSubscription: Subscription;
  chatIDSubscription: Subscription;

  Device = Device;
  icons = {
    cog: faCog
  };

  loggedUser: User | null = null;
  messageRows: MessageRow[] = [];
  activeChatID = "";
  yourID = "";
  componentFirstInit = true;

  constructor(private router: Router, private storeService: StoreService, private toastr: ToastrService) {
    this.loggedUserSubscription = this.storeService.loggedUser$.subscribe(user => {
      this.loggedUser = user;
      if (this.loggedUser?.avatar) {
        this.storeService.updateCounter(this.loggedUser?.requests.received.length);
        const timestamp = new Date().getTime();
        this.loggedUser.avatar = this.ensureFullURL(this.loggedUser.avatar) + `?${timestamp}`;
      }
      if (this.loggedUser?._id) {
        this.yourID = this.loggedUser._id;
      }
    });
    this.chatIDSubscription = this.storeService.chatID$.subscribe(chatID => {
      this.activeChatID = chatID;
    });
  }

  ngOnInit(): void {
    fetch(`${environment.apiURL}/access/friends/${this.yourID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Retrieving messages failed');
        }
        return response.json();
      })
      .then(data => {
        if (data.length === 0) {
          this.storeService.updateChatID('no-messages');
          return;
        }
        this.messageRows = data.map((messageRow: MessageRow) => ({
          ...messageRow,
          lastMessage: {
            ...messageRow.lastMessage,
            date: messageRow.lastMessage.date
          }
        }));
        // this.messageRows.forEach(messageRow => {
        //   console.log(messageRow.lastMessage);
        // })
        console.log(data)
        this.sortMessages();
        this.storeService.updateChatID(data[0].id);
      })
      .catch(error => {
        this.toastr.error('An Error Occured while retrieving your messages!', 'Messages Error');
        console.error('Messages Error:', error);
      })
  }

  sortMessages() {
    this.messageRows.sort((a, b) => {
      if (!a.lastMessage || !a.lastMessage.date || !b.lastMessage || !b.lastMessage.date) return 0;
      const dateA = a.lastMessage.date instanceof Date ? a.lastMessage.date : new Date(a.lastMessage.date);
      const dateB = b.lastMessage.date instanceof Date ? b.lastMessage.date : new Date(b.lastMessage.date);
      const timeA = dateA.getTime();
      const timeB = dateB.getTime();
      return timeB - timeA;
    });
  }

  showMessages(id: string) {
    if (id === this.activeChatID && this.device === Device.DESKTOP && !this.componentFirstInit) return;
    this.storeService.updateChatID(id);
    this.router.navigate(['/access/chat/', id]);
    this.componentFirstInit = false;
  }
  ensureFullURL(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${environment.serverURL}/${path}`;
  }

}
