import { Component, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faCog, faComments, faEnvelope, faFaceLaugh, faFingerprint, faKey, faMicrophone, faRightFromBracket, faTrashCan, faUser, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { FooterComponent } from '../../features/footer/footer.component';
import { StoreService } from '../../services/store.service';
import { SocketService } from '../../services/socket.service';
import { ToastrService } from 'ngx-toastr';
import { ModalComponent } from '../../features/modal-wrapper/modal-wrapper.component';
import { Modal } from '../../typescript/enums';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { User } from '../../typescript/interfaces';

import { EditNameComponent } from './edit-zone/edit-name/edit-name.component';
import { EditLastnameComponent } from './edit-zone/edit-lastname/edit-lastname.component';
import { EditMailComponent } from './edit-zone/edit-mail/edit-mail.component';
import { EditPasswordComponent } from './edit-zone/edit-password/edit-password.component';
import { FingerprintComponent } from './biometric-zone/fingerprint/fingerprint.component';
import { FaceComponent } from './biometric-zone/face/face.component';
import { VoiceComponent } from './biometric-zone/voice/voice.component';
import { DeleteMessagesComponent } from './danger-zone/delete-messages/delete-messages.component';
import { DeleteAccountComponent } from './danger-zone/delete-account/delete-account.component';
import { ChangeAvatarComponent } from './change-avatar/change-avatar.component';


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    RouterModule,
    FooterComponent,
    ChangeAvatarComponent,
    ModalComponent,
    EditNameComponent,
    EditLastnameComponent,
    EditMailComponent,
    EditPasswordComponent,
    FingerprintComponent,
    FaceComponent,
    VoiceComponent,
    DeleteMessagesComponent,
    DeleteAccountComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnDestroy {

  subscription: Subscription;
  loggedUser: User | null = null;

  icons = {
    section: faCog,
    back: faChevronLeft,
    logout: faRightFromBracket,
    messages: faComments,
    remove: faTrashCan,
    edit: {
      name: faUser,
      lastname: faUserGroup,
      mail: faEnvelope,
      password: faKey
    },
    biometric: {
      fingerprint: faFingerprint,
      face: faFaceLaugh,
      voice: faMicrophone
    }
  }

  isModalVisible = false;
  modalContent = Modal.CHANGE_AVATAR;
  ModalContent = Modal;

  constructor(
    private storeService: StoreService,
    private socketService: SocketService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.subscription = this.storeService.loggedUser$.subscribe(user => {
      this.loggedUser = user;
    });
  }

  editName() {
    this.isModalVisible = true;
    this.modalContent = Modal.EDIT_NAME;
  }

  editLastname() {
    this.isModalVisible = true;
    this.modalContent = Modal.EDIT_LASTNAME;
  }

  editMail() {
    this.isModalVisible = true;
    this.modalContent = Modal.EDIT_MAIL;
  }

  editPassword() {
    this.isModalVisible = true;
    this.modalContent = Modal.EDIT_PASSWORD;
  }

  setFingerprint() {
    this.isModalVisible = true;
    this.modalContent = Modal.SET_FINGERPRINT;
  }

  setFace() {
    this.isModalVisible = true;
    this.modalContent = Modal.SET_FACE;
  }

  setVoice() {
    this.isModalVisible = true;
    this.modalContent = Modal.SET_VOICE;
  }

  logout() {
    this.storeService.removeLoggedUser();
    this.socketService.disconnect();
    this.router.navigate(['/login']);
    this.toastr.success('You have successfully logged out!', 'Logout Successful');
  }

  deleteMessages() {
    this.isModalVisible = true;
    this.modalContent = Modal.DELETE_MESSAGES;

  }
  deleteAccount() {
    this.isModalVisible = true;
    this.modalContent = Modal.DELETE_ACCOUNT;
  }

  openModal() {
    this.isModalVisible = true;
  }

  closeModal() {
    this.isModalVisible = false;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
