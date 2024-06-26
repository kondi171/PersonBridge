import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CardType, ChatType } from '../../../typescript/enums';
import { CommonModule } from '@angular/common';
import { GroupInfo, UserInfo } from '../../../typescript/types';
import { StoreService } from '../../../services/store.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../app.environment';
import { ToastrService } from 'ngx-toastr';
import { trigger, style, animate, transition } from '@angular/animations';
import { Router } from '@angular/router';
import { AudioService } from '../../../services/audio.service';
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
  @Input() person: UserInfo = {
    id: "",
    name: "",
    lastname: "",
    mail: "",
    avatar: "",
  };
  @Input() group: GroupInfo = {
    id: "",
    name: "",
    avatar: "",
    participants: []
  }
  @Output() requestHandled = new EventEmitter<string>();
  @Output() blockedHandled = new EventEmitter<string>();

  CardType = CardType;
  loggedUserSubscription: Subscription;
  chatIDSubscription: Subscription;
  activeChatID = '';
  yourID = "";
  yourName = "";
  fadeOut = true;
  constructor(private router: Router, private storeService: StoreService, private toastr: ToastrService, private audioService: AudioService) {
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
    this.group.avatar = this.ensureFullURL(this.group.avatar) + `?${timestamp}`;
  }

  ngOnDestroy(): void {
    this.loggedUserSubscription.unsubscribe();
    this.chatIDSubscription.unsubscribe();
  }

  unblock() {
    this.fadeOut = false;
    setTimeout(() => {
      fetch(`${environment.apiURL}/user/settings/block`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ yourID: this.yourID, friendID: this.activeChatID })
      })
        .then(response => response.json())
        .then((data) => {
          console.log(data)
          this.toastr.success('Friend was unblocked!', `${this.person.name} ${this.person.lastname}`);
          this.audioService.playSuccessSound();
          this.blockedHandled.emit(this.person.id);
          this.storeService.forceRefreshMessages(true);
          this.storeService.updateAccessibility(this.activeChatID, data.accessibility);
        })
        .catch(error => {
          console.error('Operation failed:', error);
          this.audioService.playErrorSound();
          this.toastr.error('Operation failed!', 'Internal Error');
        });
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
          this.audioService.playSuccessSound();
          this.requestHandled.emit(this.person.id);
        })
        .catch(error => {
          console.error('Operation failed:', error);
          this.audioService.playErrorSound();
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
          this.audioService.playErrorSound();
          this.toastr.error('Operation failed!', 'Internal Error');
        })
    }, 400);
  }

  messageFriend(id: string) {
    this.storeService.updateChatID(id);
    this.storeService.updateChatType(ChatType.USER_CHAT);
    this.router.navigate([`/access/chat/user/${id}`]);
  }

  messageGroup(id: string) {
    this.storeService.updateChatID(id);
    this.storeService.updateChatType(ChatType.GROUP_CHAT);
    this.router.navigate([`/access/chat/group/${id}`]);
  }

  onImageError(event: any) {
    event.target.src = './../../../../assets/img/Blank-Avatar.jpg';
  }

  ensureFullURL(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${environment.serverURL}/${path}`;
  }
}