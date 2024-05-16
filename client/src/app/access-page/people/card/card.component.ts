import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CardType } from '../../../typescript/enums';
import { CommonModule } from '@angular/common';
import { CardData } from '../../../typescript/types';
import { StoreService } from '../../../services/store.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../app.environment';
import { ToastrService } from 'ngx-toastr';
import { trigger, style, animate, transition } from '@angular/animations';
import { Router } from '@angular/router';
@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  animations: [
    trigger('fadeOut', [
      transition(':leave', [
        animate('400ms', style({ transform: 'scale(0)', opacity: 0 }))
      ])
    ])
  ]
})
export class CardComponent implements OnInit, OnDestroy {
  @Input() type: CardType = CardType.ONLINE;
  @Input() person: CardData = {
    id: "",
    name: "",
    lastname: "",
    mail: "",
    avatar: "",
  };

  @Output() requestHandled = new EventEmitter<string>();
  @Output() blockedHandled = new EventEmitter<string>();

  CardType = CardType;
  loggedUserSubscription: Subscription;
  chatIDSubscription: Subscription;
  activeChatID = '';
  yourID = "";
  yourName = "";
  fadeOut = true;
  constructor(private router: Router, private storeService: StoreService, private toastr: ToastrService) {
    this.loggedUserSubscription = this.storeService.loggedUser$.subscribe(user => {
      const loggedUser = user;
      if (loggedUser) {
        this.yourID = loggedUser._id;
        this.yourName = loggedUser.name;
      }
    });
    this.chatIDSubscription = this.storeService.chatID$.subscribe(chatID => {
      this.activeChatID = chatID;
    });
  }

  ngOnInit(): void {
    const timestamp = new Date().getTime();
    this.person.avatar = this.ensureFullURL(this.person.avatar) + `?${timestamp}`;
  }

  unblock() {
    this.fadeOut = false;
    setTimeout(() => {
      fetch(`${environment.apiURL}/people/blocked`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ yourID: this.yourID, friendID: this.person.id })
      })
        .then(response => response.json())
        .then(data => {
          this.toastr.success(data.message, `${this.person.name} ${this.person.lastname}`);
          this.blockedHandled.emit(this.person.id);
        })
        .catch(error => {
          console.error('Operation failed:', error);
          this.toastr.error('Operation failed!', 'Internal Error');
        })
    }, 400);
  }

  acceptRequest() {
    this.fadeOut = false;
    setTimeout(() => {
      fetch(`${environment.apiURL}/people/request`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ yourID: this.yourID, friendID: this.person.id, yourName: this.yourName, friendName: this.person.name })
      })
        .then(response => response.json())
        .then(data => {
          this.toastr.success(data.message, `${this.person.name} ${this.person.lastname}`);
          this.requestHandled.emit(this.person.id);
        })
        .catch(error => {
          console.error('Operation failed:', error);
          this.toastr.error('Operation failed!', 'Internal Error');
        })
    }, 400);
  }

  ignoreRequest() {
    this.fadeOut = false;
    setTimeout(() => {
      fetch(`${environment.apiURL}/people/request`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ yourID: this.yourID, friendID: this.person.id })
      })
        .then(response => response.json())
        .then(data => {
          this.toastr.warning(data.message, `${this.person.name} ${this.person.lastname}`);
          this.requestHandled.emit(this.person.id);
        })
        .catch(error => {
          console.error('Operation failed:', error);
          this.toastr.error('Operation failed!', 'Internal Error');
        })
    }, 400);
  }
  messageFriend(id: string) {
    this.storeService.updateChatID(id);
    this.router.navigate([`/access/chat/${id}`]);
  }
  ensureFullURL(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${environment.serverURL}/${path}`;
  }

  ngOnDestroy(): void {
    this.loggedUserSubscription.unsubscribe();
    this.chatIDSubscription.unsubscribe();
  }
}
