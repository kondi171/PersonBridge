import { Component, OnDestroy, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBellSlash, faCommentSlash, faLock, faKey, faA, faComments, faUserMinus, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FooterComponent } from '../../../features/footer/footer.component';
import { RouterModule } from '@angular/router';
import { Position } from '../../../typescript/enums';
import { Subscription } from 'rxjs';
import { StoreService } from '../../../services/store.service';
import { environment } from '../../../app.environment';
import { ToastrService } from 'ngx-toastr';
import { FriendSettingsData } from '../../../typescript/interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-settings',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FooterComponent, RouterModule],
  templateUrl: './chat-settings.component.html',
  styleUrl: './chat-settings.component.scss'
})
export class ChatSettingsComponent implements OnInit, OnDestroy {
  Position = Position;

  icons = {
    messages: faComments,
    mute: faBellSlash,
    ignore: faCommentSlash,
    block: faLock,
    pin: faKey,
    nickname: faA,
    remove: faUserMinus,
    back: faChevronLeft,
  }

  chatIDSubscription: Subscription;
  loggedUserSubscription: Subscription;
  activeChatID = '';
  yourID = '';
  friendInfo: FriendSettingsData = {
    id: '',
    name: '',
    lastname: '',
    mail: '',
    avatar: '',
    messagesCounter: 0,
    settings: {
      nickname: '',
      PIN: 0
    },
    accessibility: {
      mute: false,
      ignore: false,
      block: false
    }
  }

  constructor(private storeService: StoreService, private toastr: ToastrService) {
    this.chatIDSubscription = this.storeService.chatID$.subscribe(chatID => {
      this.activeChatID = chatID;
    });
    this.loggedUserSubscription = this.storeService.loggedUser$.subscribe(user => {
      if (user) this.yourID = user?._id;
    })
  }

  ngOnInit(): void {
    fetch(`${environment.apiURL}/chat-settings/${this.yourID}/${this.activeChatID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then(response => response.json())
      .then(data => {
        const { id, name, lastname, mail, avatar, settings, accessibility } = data.friend;
        const timestamp = new Date().getTime();
        this.friendInfo = {
          id: id,
          name: name,
          lastname: lastname,
          mail: mail,
          avatar: this.ensureFullURL(avatar) + `?${timestamp}`,
          messagesCounter: data.messages.length,
          settings: settings,
          accessibility: accessibility
        }
      })
      .catch(error => {
        this.toastr.error('An Error Occured while fetching friend!', 'Data Retrieve Error');
        console.error('Data Retrieve Error:', error);
      });
  }

  handleMute() {
    // Messages incoming but user is not informing about that. Friend can send a messages.
    fetch(`${environment.apiURL}/chat-settings/mute`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ yourID: this.yourID, friendID: this.activeChatID })
    })
      .then(response => response.json())
      .then(data => {
        if (data.mute) this.toastr.warning('Friend was muted!', `${this.friendInfo.name} ${this.friendInfo.lastname}`);
        else this.toastr.success('Friend was unmuted!', `${this.friendInfo.name} ${this.friendInfo.lastname}`);
        this.friendInfo.accessibility.mute = !this.friendInfo.accessibility.mute;
      })
      .catch(error => {
        this.toastr.error('An Error Occured while muting friend!', 'Accessibility Change Error');
        console.error('Accessibility Change Error:', error);
      });
  }

  handleIgnore() {
    // Messages are not incoming. Friend can send a messages.
    fetch(`${environment.apiURL}/chat-settings/ignore`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ yourID: this.yourID, friendID: this.activeChatID })
    })
      .then(response => response.json())
      .then(data => {
        if (data.ignore) this.toastr.warning('Friend was ignored!', `${this.friendInfo.name} ${this.friendInfo.lastname}`);
        else this.toastr.success('Friend was unignored!', `${this.friendInfo.name} ${this.friendInfo.lastname}`);
        this.friendInfo.accessibility.ignore = !this.friendInfo.accessibility.ignore;
      })
      .catch(error => {
        this.toastr.error('An Error Occured while ignoring friend!', 'Accessibility Change Error');
        console.error('Accessibility Change Error:', error);
      });
  }

  handleBlock() {
    // Messages are not incoming. Both User and Friend cannot send a messages.
    fetch(`${environment.apiURL}/chat-settings/block`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ yourID: this.yourID, friendID: this.activeChatID })
    })
      .then(response => response.json())
      .then(data => {
        if (data.block) this.toastr.warning('Friend was blocked!', `${this.friendInfo.name} ${this.friendInfo.lastname}`);
        else this.toastr.success('Friend was unblocked!', `${this.friendInfo.name} ${this.friendInfo.lastname}`);
        this.friendInfo.accessibility.block = !this.friendInfo.accessibility.block;
      })
      .catch(error => {
        this.toastr.error('An Error Occured while blocking friend!', 'Accessibility Change Error');
        console.error('Accessibility Change Error:', error);
      });
  }

  ngOnDestroy(): void {
    this.chatIDSubscription.unsubscribe();
    this.loggedUserSubscription.unsubscribe();
  }

  ensureFullURL(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${environment.serverURL}/${path}`;
  }
}