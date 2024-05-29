import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCog, faUsers, faComments, faSearch, faBrain, faPhone } from '@fortawesome/free-solid-svg-icons';
import { ChatType, Device } from '../../typescript/enums';
import { StoreService } from '../../services/store.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { environment } from '../../app.environment';
import { SocketService } from '../../services/socket.service'; // Import SocketService

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() device = Device.DESKTOP;
  Device = Device;
  requestSubscription: Subscription;
  chatIDSubscription: Subscription;
  chatTypeSubscription: Subscription;
  requestsCounter: number = 0;
  chatID: string = '';
  chatType: ChatType = ChatType.USER_CHAT;

  icons = {
    chats: faComments,
    friends: faUsers,
    explore: faSearch,
    chatbots: faBrain,
    calls: faPhone,
    settings: faCog,
  }
  yourID = '';

  constructor(
    private storeService: StoreService,
    private router: Router,
    private socketService: SocketService
  ) {
    this.requestSubscription = this.storeService.counter$.subscribe(counter => {
      this.requestsCounter = counter;
    });
    this.chatIDSubscription = this.storeService.chatID$.subscribe(chatID => {
      this.chatID = chatID;
    });
    this.chatTypeSubscription = this.storeService.chatType$.subscribe(chatType => {
      this.chatType = chatType;
    });
    const loggedUser = this.storeService.getLoggedUser();
    if (loggedUser) this.yourID = loggedUser._id;
  }

  ngOnInit(): void {
    if (this.yourID) {
      this.socketService.onSendRequest(() => {
        this.requestsCounter++;
        this.storeService.updateCounter(this.requestsCounter);
      });
      this.socketService.onCancelRequest(() => {
        this.requestsCounter--;
        this.storeService.updateCounter(this.requestsCounter);
      });
    }

    fetch(`${environment.apiURL}/people/requests/${this.yourID}`, {
      method: 'GET',
    })
      .then(response => response.json())
      .then(data => {
        this.storeService.updateCounter(data.length);
      })
      .catch(error => {
        console.error('Error fetching friend requests:', error);
      });
  }

  ngOnDestroy(): void {
    if (this.chatIDSubscription) {
      this.chatIDSubscription.unsubscribe();
    }
    if (this.requestSubscription) {
      this.requestSubscription.unsubscribe();
    }
    this.socketService.disconnect();
  }

  get isChatActive(): boolean {
    const path = this.router.url;
    const chat = path.slice(0, 13);
    return chat === '/access/chat/';
  }
}
