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
import { AudioService } from '../../services/audio.service';

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
  newMessageSubscription: Subscription;
  forceRefreshMessagesInPanel: Subscription;

  Device = Device;
  icons = {
    cog: faCog,
    group: faCirclePlus
  };

  loggedUser: User | null = null;
  friends: MessageRow[] = [];
  groups: MessageRow[] = [];
  messageRows: MessageRow[] = [];
  activeChatID = "";
  activeChatType = ChatType.USER_CHAT;
  yourID = "";
  componentFirstInit = true;
  isModalVisible = false;
  UserStatus = UserStatus;
  status: UserStatus = UserStatus.ONLINE;
  forceMessages: boolean = false;
  isInitialized: boolean = false;

  constructor(
    private router: Router,
    private storeService: StoreService,
    private toastr: ToastrService,
    private audioService: AudioService
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
    });
    this.chatIDSubscription = this.storeService.chatID$.subscribe(chatID => {
      this.activeChatID = chatID;
    });
    this.chatTypeSubscription = this.storeService.chatType$.subscribe(chatType => {
      this.activeChatType = chatType;
    });
    this.newMessageSubscription = this.storeService.newMessage$.subscribe(() => {
      this.fetchMessages();
    });

    this.forceRefreshMessagesInPanel = this.storeService.refreshMessages$.subscribe(force => {
      this.forceMessages = force;
      if (this.forceMessages) {
        this.fetchMessages();
        this.storeService.forceRefreshMessages(false);
      }
    });
  }

  ngOnInit(): void {
    this.fetchMessages();
  }

  ngOnDestroy(): void {
    this.loggedUserSubscription.unsubscribe();
    this.chatIDSubscription.unsubscribe();
    this.chatTypeSubscription.unsubscribe();
    this.newMessageSubscription.unsubscribe();
    this.forceRefreshMessagesInPanel.unsubscribe();
  }

  fetchMessages() {
    fetch(`${environment.apiURL}/access/friends-and-groups/${this.yourID}`, {
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
        const friends = data.friends;
        const groups = data.groups;
        this.messageRows = [...friends, ...groups];
        this.sortMessages();
        this.isInitialized = true;
      })
      .catch(error => {
        this.toastr.error('An Error Occured while retrieving your messages!', 'Messages Error');
        this.audioService.playErrorSound();
        console.error('Messages Error:', error);
      });
  }

  sortMessages() {
    this.messageRows.sort((a, b) => {
      const dateA = a.lastMessage ? new Date(a.lastMessage.date) : new Date(0);
      const dateB = b.lastMessage ? new Date(b.lastMessage.date) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  }

  showMessages(chatID: string, chatType: ChatType) {
    // const trimmedURL = this.router.url.slice(13);
    // const chatPathForUser = `user/${chatID}/settings`;
    // const chatPathForGroup = `group/${chatID}/settings`;

    // if (chatID === this.activeChatID &&
    //   this.device === Device.DESKTOP &&
    //   !this.componentFirstInit &&
    //   (trimmedURL !== chatPathForUser && trimmedURL !== chatPathForGroup)) {
    //   return;
    // }
    this.audioService.playChangeStateSound();
    this.storeService.updateChatType(chatType);
    this.storeService.updateChatID(chatID);
    this.router.navigate(['/access/chat/', chatType, chatID]);
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
      .then(response => response.json())
      .then(data => {
        this.status = data.status;
        if (status === UserStatus.ONLINE)
          this.toastr.info('You have successfully changed your status!', 'You are Online');
        else this.toastr.info('You have successfully changed your status!', 'You are Offline');
      })
      .catch(error => {
        this.toastr.error('An Error Occured while changing status!', 'Status Change Error');
        this.audioService.playErrorSound();
        console.error('Login Error:', error);
      });
  }

  openModal() {
    this.isModalVisible = true;
    this.audioService.playChangeStateSound();
  }

  closeModal() {
    this.isModalVisible = false;
  }

  onImageError(event: any) {
    event.target.src = './../../../assets/img/Blank-Avatar.jpg';
  }

  ensureFullURL(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${environment.serverURL}/${path}`;
  }
}
