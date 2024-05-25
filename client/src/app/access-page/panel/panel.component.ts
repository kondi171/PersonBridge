import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCirclePlus, faCog } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from "../../features/navbar/navbar.component";
import { ChatType, Device, UserStatus } from '../../typescript/enums';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../services/store.service';
import { User } from '../../typescript/interfaces';
import { MessageRow } from '../../typescript/interfaces';
import { environment } from '../../app.environment';
import { ToastrService } from 'ngx-toastr';
import { ModalComponent } from '../../features/modal-wrapper/modal-wrapper.component';
import { CreateGroupComponent } from './create-group/create-group.component';
import { MessageRowComponent } from './message-row/message-row.component';
import { UpdateUserService } from '../../services/update-user.service'; // Import the UpdateUserService

@Component({
  selector: 'app-panel',
  standalone: true,
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
  imports: [
    CommonModule,
    FontAwesomeModule,
    RouterModule,
    NavbarComponent,
    ModalComponent,
    CreateGroupComponent,
    MessageRowComponent
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
  UserStatus = UserStatus;

  constructor(
    private router: Router,
    private storeService: StoreService,
    private toastr: ToastrService,
    private updateUserService: UpdateUserService // Inject the UpdateUserService
  ) {
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
      if (this.loggedUser?.status) {
        this.refreshUser(this.loggedUser._id); // Call the method to update the user
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
    this.chatTypeSubscription.unsubscribe();
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
    this.storeService.updateChatID(id);
    this.router.navigate(['/access/chat/', id]);
    this.componentFirstInit = false;
  }

  toggleStatus(status: UserStatus) {
    fetch(`${environment.apiURL}/access/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ yourID: this.yourID, status: status })
    })
      .then(() => {
        if (status === UserStatus.ONLINE)
          this.toastr.info('You have successfully changed your status!', 'You are Online');
        else this.toastr.info('You have successfully changed your status!', 'You are Offline');
      })
      .catch(error => {
        this.toastr.error('An Error Occured while changing status!', 'Status Change Error');
        console.error('Login Error:', error);
      });
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

  // Add this method to update the user
  refreshUser(userID: string) {
    this.updateUserService.updateUser(userID).then(updatedUser => {
      this.storeService.setLoggedUser(updatedUser);
    }).catch(error => {
      console.error('Failed to update user:', error);
    });
  }
}
