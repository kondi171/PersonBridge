import { Component, Input, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCog, faUsers, faComments, faSearch, faBrain } from '@fortawesome/free-solid-svg-icons';
import { Device } from '../../typescript/enums';
import { StoreService } from '../../services/store.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { User } from '../../typescript/interfaces';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnDestroy {
  @Input() device = Device.DESKTOP;
  Device = Device;
  requestSubscription: Subscription;
  chatIDSubscription: Subscription;
  requestsCounter: number = 0;
  chatID: string = '';

  icons = {
    chats: faComments,
    friends: faUsers,
    explore: faSearch,
    chatbots: faBrain,
    settings: faCog,
  }

  constructor(private storeService: StoreService, private router: Router) {
    this.requestSubscription = this.storeService.counter$.subscribe(counter => {
      this.requestsCounter = counter;
    });
    this.chatIDSubscription = this.storeService.chatID$.subscribe(chatID => {
      this.chatID = chatID;
    });
  }

  ngOnDestroy(): void {
    if (this.chatIDSubscription) {
      this.chatIDSubscription.unsubscribe();
    }
  }

  get isChatActive(): boolean {
    const path = this.router.url;
    const chat = path.slice(0, 13)
    if (chat === '/access/chat/') return true;
    else return false;
  }
}
