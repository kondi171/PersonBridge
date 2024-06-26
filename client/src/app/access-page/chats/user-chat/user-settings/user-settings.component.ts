import { Component, OnDestroy, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBellSlash, faCommentSlash, faLock, faKey, faA, faComments, faUserMinus, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FooterComponent } from '../../../../features/footer/footer.component';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { StoreService } from '../../../../services/store.service';
import { environment } from '../../../../app.environment';
import { ToastrService } from 'ngx-toastr';
import { Modal, Position } from '../../../../typescript/enums';
import { FriendSettingsData } from '../../../../typescript/interfaces';
import { AccessibilityAction } from '../../../../typescript/types';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../features/modal-wrapper/modal-wrapper.component';
import { FormsModule } from '@angular/forms';
import { DeleteMessagesWithUserComponent } from './delete-messages-with-user/delete-messages-with-user.component';
import { RemoveFriendComponent } from './remove-friend/remove-friend.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { AudioService } from '../../../../services/audio.service';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, FooterComponent, RouterModule, ModalComponent, DeleteMessagesWithUserComponent, RemoveFriendComponent],
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-in', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class UserSettingsComponent implements OnInit, OnDestroy {
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
  };

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
  };

  nickname = '';
  PIN = ['', '', '', ''];
  isModalVisible = false;
  modalContent = Modal.DELETE_MESSAGES;
  ModalContent = Modal;
  isInitialized: boolean = false;

  constructor(private storeService: StoreService, private toastr: ToastrService, private audioService: AudioService) {
    this.chatIDSubscription = this.storeService.chatID$.subscribe(chatID => {
      this.activeChatID = chatID;
    });
    this.loggedUserSubscription = this.storeService.loggedUser$.subscribe(user => {
      if (user) this.yourID = user._id;
    });
  }

  ngOnInit(): void {
    if (this.activeChatID === 'no-messages') return;
    fetch(`${environment.apiURL}/user/settings/${this.yourID}/${this.activeChatID}`, {
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
        this.isInitialized = true;
      })
      .catch(error => {
        this.toastr.error('An Error Occurred while fetching friend!', 'Data Retrieve Error');
        this.audioService.playErrorSound();
        console.error('Data Retrieve Error:', error);
      });
  }

  ngOnDestroy(): void {
    this.chatIDSubscription.unsubscribe();
    this.loggedUserSubscription.unsubscribe();
  }

  handleMute() {
    this.updateAccessibility('mute', 'Friend was muted!', 'Friend was unmuted!');
  }

  handleIgnore() {
    this.updateAccessibility('ignore', 'Friend was ignored!', 'Friend was unignored!');
  }

  handleBlock() {
    this.updateAccessibility('block', 'Friend was blocked!', 'Friend was unblocked!');
  }

  updateAccessibility(action: AccessibilityAction, successMessage: string, revertMessage: string) {
    fetch(`${environment.apiURL}/user/settings/${action}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ yourID: this.yourID, friendID: this.activeChatID })
    })
      .then(response => response.json())
      .then(data => {
        const isActionEnabled = data[action];
        const message = isActionEnabled ? successMessage : revertMessage;
        this.toastr.success(message, `${this.friendInfo.name} ${this.friendInfo.lastname}`);
        this.audioService.playSuccessSound();
        this.friendInfo.accessibility[action] = isActionEnabled;
        this.storeService.updateAccessibility(this.activeChatID, this.friendInfo.accessibility);
      })
      .catch(error => {
        this.toastr.error(`An Error Occurred while ${action} friend!`, 'Accessibility Change Error');
        this.audioService.playErrorSound();
        console.error('Accessibility Change Error:', error);
      });
  }

  handleSetNickname() {
    if (!this.nickname) {
      this.toastr.error('Nickname which you provided is empty!', 'Edit failed');
      this.audioService.playErrorSound();
      return;
    }
    if (this.nickname.length > 20) {
      this.toastr.error('Nickname can be up to 20 characters long!', 'Edit failed');
      this.audioService.playErrorSound();
      return;
    }
    fetch(`${environment.apiURL}/user/settings/nickname`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ yourID: this.yourID, friendID: this.activeChatID, nickname: this.nickname })
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === "Nickname set successfully") {
          this.toastr.success(`${data.message}!`, `${this.friendInfo.name} ${this.friendInfo.lastname}`);
          this.nickname = '';
        } else {
          this.toastr.error(`${data.message}!`, `${this.friendInfo.name} ${this.friendInfo.lastname}`);
          this.audioService.playSuccessSound();
          this.audioService.playErrorSound();
        }
      })
      .catch(error => {
        this.toastr.error('An Error Occurred while editing nickname!', 'Nickname Change Error');
        this.audioService.playErrorSound();
        console.error('Nickname Change Error:', error);
      });
  }

  validateInput(event: KeyboardEvent): void {
    const inputChar = String.fromCharCode(event.keyCode);
    if (!/^[0-9]$/.test(inputChar)) {
      event.preventDefault();
    }
  }

  moveFocus(currentInput: HTMLInputElement, nextInput: HTMLInputElement | null): void {
    if (currentInput.value.length >= currentInput.maxLength && nextInput) {
      nextInput.focus();
    }
  }

  handleSetPIN() {
    const pinCode = this.PIN.join('');
    if (!pinCode) {
      this.toastr.error('PIN which you provided is empty!', 'Edit failed');
      this.audioService.playErrorSound();
      return;
    }
    if (pinCode.length !== 4) {
      this.toastr.error('PIN must contain exactly 4 digits!', 'Edit failed');
      this.audioService.playErrorSound();
      return;
    }
    this.updatePIN('PATCH', pinCode, 'PIN set successfully');
  }

  handleRemovePIN() {
    this.updatePIN('DELETE', '', 'PIN removed successfully');
  }

  updatePIN(method: string, pinCode: string, successMessage: string) {
    fetch(`${environment.apiURL}/user/settings/PIN`, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ yourID: this.yourID, friendID: this.activeChatID, PIN: pinCode })
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === successMessage) {
          this.toastr.success(`${data.message}!`, `${this.friendInfo.name} ${this.friendInfo.lastname}`);
          this.audioService.playSuccessSound();
          this.PIN = ['', '', '', ''];
        } else {
          this.toastr.error(`${data.message}!`, `${this.friendInfo.name} ${this.friendInfo.lastname}`);
          this.audioService.playErrorSound();
        }
      })
      .catch(error => {
        this.toastr.error(`An Error Occurred while editing PIN!`, 'PIN Change Error');
        this.audioService.playErrorSound();
        console.error('PIN Change Error:', error);
      });
  }

  handleDeleteMessages() {
    this.openModal(Modal.DELETE_MESSAGES);
  }

  handleRemoveFriend() {
    this.openModal(Modal.REMOVE_FRIEND);
  }

  openModal(content: Modal) {
    this.modalContent = content;
    this.isModalVisible = true;
    this.audioService.playChangeStateSound();
  }

  closeModal() {
    this.isModalVisible = false;
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
