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
import { ChatbotSettingsData } from '../../../../typescript/interfaces';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../features/modal-wrapper/modal-wrapper.component';
import { FormsModule } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';
import { AudioService } from '../../../../services/audio.service';
import { DeleteMessagesWithBotComponent } from './delete-messages-with-bot/delete-messages-with-bot.component';

@Component({
  selector: 'app-bot-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, FooterComponent, RouterModule, ModalComponent, DeleteMessagesWithBotComponent],
  templateUrl: './bot-settings.component.html',
  styleUrls: ['./bot-settings.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-in', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class BotSettingsComponent implements OnInit, OnDestroy {
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

  chatbotInfo: ChatbotSettingsData = {
    id: '',
    name: '',
    founder: '',
    description: '',
    messagesCounter: 0,
    settings: {
      nickname: '',
      PIN: 0
    }
  }

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
    fetch(`${environment.apiURL}/bot/settings/${this.yourID}/${this.activeChatID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then(response => response.json())
      .then(data => {
        const { id, name, founder, description, settings } = data.chatbot;
        this.chatbotInfo = {
          id: id,
          name: name,
          founder: founder,
          description: description,
          messagesCounter: data.messages.length,
          settings: settings,
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
    fetch(`${environment.apiURL}/bot/settings/nickname`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ yourID: this.yourID, chatbotID: this.activeChatID, nickname: this.nickname })
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === "Nickname set successfully") {
          this.toastr.success(`${data.message}!`, this.chatbotInfo.name);
          this.nickname = '';
        } else {
          this.toastr.error(`${data.message}!`, this.chatbotInfo.name);
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
    fetch(`${environment.apiURL}/bot/settings/PIN`, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ yourID: this.yourID, chatbotID: this.activeChatID, PIN: pinCode })
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === successMessage) {
          this.toastr.success(`${data.message}!`, this.chatbotInfo.name);
          this.audioService.playSuccessSound();
          this.PIN = ['', '', '', ''];
        } else {
          this.toastr.error(`${data.message}!`, this.chatbotInfo.name);
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

  openModal(content: Modal) {
    this.modalContent = content;
    this.isModalVisible = true;
    this.audioService.playChangeStateSound();
  }

  closeModal() {
    this.isModalVisible = false;
  }
}
