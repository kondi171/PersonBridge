import { Component, OnDestroy, OnInit } from '@angular/core';
import { CardComponent } from './card/card.component';
import { CardType, Position } from '../../typescript/enums';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faPeopleGroup, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FooterComponent } from '../../features/footer/footer.component';
import { RouterModule } from '@angular/router';
import { environment } from '../../app.environment';
import { StoreService } from '../../services/store.service';
import { CommonModule } from '@angular/common';
import { GroupInfo, UserInfo } from '../../typescript/types';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-people',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterModule, CardComponent, FooterComponent],
  templateUrl: './people.component.html',
  styleUrl: './people.component.scss',
  animations: [
    trigger('fadeInCard', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(100vh)' }),
        animate('600ms ease-in', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeInTotal', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0)' }),
        animate('600ms ease-in', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class PeopleComponent implements OnInit {
  Position = Position;
  CardType = CardType;
  icons = {
    section: faUsers,
    back: faChevronLeft,
    friends: faPeopleGroup
  }

  yourID = "";
  online: UserInfo[] = [];
  offline: UserInfo[] = [];
  groups: GroupInfo[] = [];
  blocked: UserInfo[] = [];
  requests: UserInfo[] = [];
  totalFriends: number = 0;

  constructor(private storeService: StoreService) {
    const loggedUser = storeService.getLoggedUser();
    if (loggedUser) {
      this.yourID = loggedUser._id;
    }
  }

  ngOnInit(): void {
    this.showOnline();
    this.showOffline();
    this.showGroups();
    this.showBlocked();
    this.showRequests();
  }
  showOnline() {
    fetch(`${environment.apiURL}/people/online/${this.yourID}`, {
      method: 'GET',
    })
      .then(response => response.json())
      .then(data => {
        this.online = data;
        this.updateTotalFriends();
      })
      .catch(error => {
        console.error('Online fetch error:', error);
      })
  }
  showOffline() {
    fetch(`${environment.apiURL}/people/offline/${this.yourID}`, {
      method: 'GET',
    })
      .then(response => response.json())
      .then(data => {
        this.offline = data;
        this.updateTotalFriends();
      })
      .catch(error => {
        console.error('Offline fetch error', error);
      })
  }
  showGroups() {
    fetch(`${environment.apiURL}/people/groups/${this.yourID}`, {
      method: 'GET',
    })
      .then(response => response.json())
      .then(data => {
        const groupInfo = data.map((group: GroupInfo) => ({
          id: group.id,
          name: group.name,
          avatar: group.avatar,
          participants: group.participants
        }));
        this.groups = groupInfo;
      })
      .catch(error => {
        console.error('Groups fetch error', error);
      })
  }
  showBlocked() {
    fetch(`${environment.apiURL}/people/blocked/${this.yourID}`, {
      method: 'GET',
    })
      .then(response => response.json())
      .then(data => {
        this.blocked = data;
      })
      .catch(error => {
        console.error('Blocked fetch error', error);
      })
  }
  showRequests() {
    fetch(`${environment.apiURL}/people/requests/${this.yourID}`, {
      method: 'GET',
    })
      .then(response => response.json())
      .then(data => {
        this.requests = data;
      })
      .catch(error => {
        console.error('Requests fetch error', error);
      })
  }
  handleRequest(requestID: string) {
    this.requests = this.requests.filter(request => request.id !== requestID);
    this.storeService.updateCounter(this.requests.length);
    this.showOnline();
    this.showOffline();
  }
  handleBlocked(blockID: string) {
    this.blocked = this.blocked.filter(block => block.id !== blockID);
    this.showOnline();
    this.showOffline();
  }
  updateTotalFriends() {
    this.totalFriends = this.online.length + this.offline.length;
  }
}
