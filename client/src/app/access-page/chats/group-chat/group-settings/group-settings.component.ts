import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBellSlash, faCommentSlash, faLock, faKey, faA, faComments, faUserMinus, faChevronLeft, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FooterComponent } from '../../../../features/footer/footer.component';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { StoreService } from '../../../../services/store.service';
import { environment } from '../../../../app.environment';
import { ToastrService } from 'ngx-toastr';
import { Modal, Position } from '../../../../typescript/enums';
import { GroupSettingsData, Message } from '../../../../typescript/interfaces';
import { AccessibilityAction } from '../../../../typescript/types';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../features/modal-wrapper/modal-wrapper.component';
import { FormsModule } from '@angular/forms';
import { DeleteMessagesWithGroupComponent } from './delete-messages-with-group/delete-messages-with-group.component';
import { LeaveGroupComponent } from './leave-group/leave-group.component';
import { ChangeGroupNameComponent } from './change-group-name/change-group-name.component';
import { AddParticipantsComponent } from './add-participants/add-participants.component';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-group-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, FooterComponent, RouterModule, ModalComponent, ChangeGroupNameComponent, AddParticipantsComponent, DeleteMessagesWithGroupComponent, LeaveGroupComponent],
  templateUrl: './group-settings.component.html',
  styleUrls: ['./group-settings.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-in', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class GroupSettingsComponent implements OnInit, OnDestroy {
  @ViewChild(ChangeGroupNameComponent) changeGroupNameComponent!: ChangeGroupNameComponent;
  @ViewChild(AddParticipantsComponent) addParticipantsComponent!: AddParticipantsComponent;
  Position = Position;

  icons = {
    messages: faComments,
    mute: faBellSlash,
    ignore: faCommentSlash,
    add: faUserPlus,
    leave: faUserMinus,
    back: faChevronLeft,
  };

  chatIDSubscription: Subscription;
  loggedUserSubscription: Subscription;
  activeChatID = '';
  yourID = '';
  groupInfo: GroupSettingsData = {
    id: '',
    name: '',
    avatar: '',
    administrator: {
      id: '',
      name: '',
      lastname: '',
      avatar: ''
    },
    participants: [],
    accessibility: {
      mute: false,
      ignore: false
    },
    messages: []
  };
  messagesCounter: number = 0;
  isModalVisible = false;
  modalContent = Modal.DELETE_MESSAGES;
  ModalContent = Modal;
  isInitialized: boolean = false;

  constructor(private storeService: StoreService, private toastr: ToastrService) {
    this.chatIDSubscription = this.storeService.chatID$.subscribe(chatID => {
      this.activeChatID = chatID;
    });
    this.loggedUserSubscription = this.storeService.loggedUser$.subscribe(user => {
      if (user) this.yourID = user._id;
    });
  }

  ngOnInit(): void {
    this.getGroupInfo();
  }

  ngOnDestroy(): void {
    this.chatIDSubscription.unsubscribe();
    this.loggedUserSubscription.unsubscribe();
  }

  getGroupInfo() {
    if (this.activeChatID === 'no-messages') return;
    fetch(`${environment.apiURL}/group/settings/${this.yourID}/${this.activeChatID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then(response => response.json())
      .then(data => {
        const { id, name, administrator, avatar, participants, accessibility, messages } = data;
        const timestamp = new Date().getTime();
        this.groupInfo = {
          id: id,
          name: name,
          avatar: this.ensureFullURL(avatar) + `?${timestamp}`,
          administrator: administrator,
          participants: participants,
          accessibility: accessibility,
          messages: messages
        }
        this.isInitialized = true;
      })
      .catch(error => {
        this.toastr.error('An Error Occurred while fetching group!', 'Data Retrieve Error');
        console.error('Data Retrieve Error:', error);
      });
  }

  handleUploadAvatar(event: Event) {
    if (this.yourID !== this.groupInfo.administrator.id) {
      this.toastr.error('You need to be administrator of this group to change it avatar!', 'Access Denied');
      return;
    }
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files ? fileInput.files[0] : null;

    if (file) {
      const formData = new FormData();
      formData.append('avatar', file);
      fetch(`${environment.apiURL}/group/settings/avatar/${this.groupInfo.id}`, {
        method: 'POST',
        body: formData
      })
        .then(response => response.json())
        .then(() => {
          this.toastr.success('Avatar uploaded successfully!', 'Success');
          this.getGroupInfo();
          fetch(`${environment.apiURL}/group/settings/avatar`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ yourID: this.yourID, groupID: this.activeChatID })
          })
            .catch(error => {
              this.toastr.error('An Error Occured while uploading avatar!', 'Avatar upload error');
              console.error('Avatar upload error:', error);
            })
        })
        .catch(error => {
          this.toastr.error('An Error Occured while uploading avatar!', 'Avatar upload error');
          console.error('Avatar upload error:', error);
        });
    } else {
      this.toastr.error('Please select a file to upload!', 'No File Selected');
    }
  }

  handleMute() {
    this.updateAccessibility('mute', 'Group was muted!', 'Group was unmuted!');
  }

  handleIgnore() {
    this.updateAccessibility('ignore', 'Group was ignored!', 'Group was unignored!');
  }

  updateAccessibility(action: AccessibilityAction, successMessage: string, revertMessage: string) {
    fetch(`${environment.apiURL}/group/settings/${action}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ yourID: this.yourID, groupID: this.activeChatID })
    })
      .then(response => response.json())
      .then(data => {
        const isActionEnabled = data[action];
        const message = isActionEnabled ? successMessage : revertMessage;
        this.toastr.success(message, `${this.groupInfo.name}`);
        this.groupInfo.accessibility[action] = isActionEnabled;
        this.storeService.updateAccessibility(this.activeChatID, this.groupInfo.accessibility);
      })
      .catch(error => {
        this.toastr.error(`An Error Occurred while ${action} group!`, 'Accessibility Change Error');
        console.error('Accessibility Change Error:', error);
      });
  }

  handleChangeGroupName() {
    if (this.yourID !== this.groupInfo.administrator.id) {
      this.toastr.error('You need to be administrator of this group to change it name!', 'Access Denied');
      return;
    }
    this.openModal(Modal.EDIT_NAME);
  }

  participantMessages(participantID: string) {
    const messages = this.groupInfo.messages.filter((message: Message) => message.sender === participantID);
    return messages.length;
  }

  handleRemoveFromGroup(participantID: string) {
    if (this.yourID === participantID) {
      this.toastr.error("You can't remove yourself from the group!", 'Access Denied');
      return;
    }
    if (this.yourID !== this.groupInfo.administrator.id) {
      this.toastr.error('You need to be administrator of this group to remove a participant!', 'Access Denied');
      return;
    }
    fetch(`${environment.apiURL}/group/settings/remove`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ yourID: this.yourID, groupID: this.activeChatID, removeID: participantID, participants: this.groupInfo.participants })
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'Participant removed from the group successfully') {
          this.toastr.success(data.message, 'Success');
          this.getGroupInfo();
        }
        else this.toastr.error(`An Error Occurred while removing participant from the group!`, 'Remove Participant Error');
      })
      .catch(error => {
        this.toastr.error(`An Error Occurred while removing participant from the group!`, 'Remove Participant Error');
        console.error('Remove Participant Error:', error);
      });
  }

  handleAddToGroup() {
    if (this.yourID !== this.groupInfo.administrator.id) {
      this.toastr.error('You need to be administrator of this group to add a participants!', 'Access Denied');
      return;
    }
    this.openModal(Modal.ADD_PARTICIPANTS);
  }

  handleDeleteMessages() {
    this.openModal(Modal.DELETE_MESSAGES);
  }

  handleLeaveGroup() {
    this.openModal(Modal.LEAVE_GROUP);
  }

  openModal(content: Modal) {
    this.modalContent = content;
    this.isModalVisible = true;
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

  onGroupNameChanged() {
    this.getGroupInfo();
  }
}
