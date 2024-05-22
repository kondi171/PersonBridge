import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCog, faUsers, faComments, faSearch, faBrain, faPhone } from '@fortawesome/free-solid-svg-icons';
import { Device } from '../../typescript/enums';
import { StoreService } from '../../services/store.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { User } from '../../typescript/interfaces';
import { environment } from '../../app.environment';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
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
    calls: faPhone,
    settings: faCog,
  }
  yourID = '';
  constructor(private storeService: StoreService, private router: Router) {
    this.requestSubscription = this.storeService.counter$.subscribe(counter => {
      this.requestsCounter = counter;
    });
    this.chatIDSubscription = this.storeService.chatID$.subscribe(chatID => {
      this.chatID = chatID;
    });
    const loggedUser = this.storeService.getLoggedUser();
    if (loggedUser) this.yourID = loggedUser._id;
  }
  ngOnInit(): void {
    fetch(`${environment.apiURL}/people/requests/${this.yourID}`, {
      method: 'GET',
    })
      .then(response => response.json())
      .then(data => {
        this.storeService.updateCounter(data.length)
      })
      .catch(error => {
        console.error('Avatar upload error:', error);
      })
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
