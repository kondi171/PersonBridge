import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCirclePlus, faCog } from '@fortawesome/free-solid-svg-icons';
import { MessageRowComponent } from './message-row/message-row.component';
import { Subscription } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from "../../features/navbar/navbar.component";
import { ChatType, Device } from '../../typescript/enums';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../services/store.service';
import { User } from '../../typescript/interfaces';
import { MessageRow } from '../../typescript/interfaces';
import { environment } from '../../app.environment';
import { ToastrService } from 'ngx-toastr';
import { ModalComponent } from '../../features/modal-wrapper/modal-wrapper.component';
import { CreateGroupComponent } from './create-group/create-group.component';

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
    NavbarComponent,
    ModalComponent,
    CreateGroupComponent
  ]
})
export class PanelComponent implements OnInit, OnDestroy {
  @Input() device: Device = Device.DESKTOP;

  loggedUserSubscription: Subscription;
  chatIDSubscription: Subscription;
  chatTypeSubscription: Subscription;

  Device = Device;
  icons = {
    cog: faCog,
    group: faCirclePlus
  };

  loggedUser: User | null = null;
  messageRows: MessageRow[] = [];
  activeChatID = "";
  activeChatType = ChatType.USER_CHAT;
  yourID = "";
  componentFirstInit = true;
  isModalVisible = false;

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
    this.chatTypeSubscription = this.storeService.chatType$.subscribe(chatType => {
      this.activeChatType = chatType;
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
        this.messageRows = data;
        console.log(this.messageRows)
        this.sortMessages();
        this.storeService.updateChatID(data[0].id);
      })
      .catch(error => {
        this.toastr.error('An Error Occured while retrieving your messages!', 'Messages Error');
        console.error('Messages Error:', error);
      });
  }

  ngOnDestroy(): void {
    this.loggedUserSubscription.unsubscribe();
    this.chatIDSubscription.unsubscribe();
  }

  sortMessages() {
    this.messageRows.sort((a, b) => {
      const dateA = a.lastMessage ? new Date(a.lastMessage.date) : new Date(0);
      const dateB = b.lastMessage ? new Date(b.lastMessage.date) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  }

  showMessages(id: string, chatType: ChatType) {
    const trimmedUrl = this.router.url.slice(13);
    const activePath = `${trimmedUrl}/settings`;
    const chatPath = `${id}/settings`;

    if (id === this.activeChatID && this.device === Device.DESKTOP && !this.componentFirstInit && activePath === chatPath) {
      return;
    }
    if (chatType === ChatType.USER_CHAT) {
      console.log(chatType + 'USER_CHAT')
    } else {
      console.log(chatType + 'GROUP_CHAT')
    }
    this.storeService.updateChatID(id);
    this.router.navigate(['/access/chat/', id]);
    this.componentFirstInit = false;
  }

  openModal() {
    this.isModalVisible = true;
  }
  closeModal() {
    this.isModalVisible = false;
  }

  ensureFullURL(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${environment.serverURL}/${path}`;
  }
}
