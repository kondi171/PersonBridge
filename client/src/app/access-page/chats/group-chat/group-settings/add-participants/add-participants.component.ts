import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { GroupSettingsData, User } from '../../../../../typescript/interfaces';
import { UserInfo } from '../../../../../typescript/types';
import { StoreService } from '../../../../../services/store.service';
import { environment } from '../../../../../app.environment';
import { AudioService } from '../../../../../services/audio.service';

@Component({
  selector: 'app-add-participants',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './add-participants.component.html',
  styleUrls: ['./add-participants.component.scss']
})
export class AddParticipantsComponent implements OnInit {
  @Input() group: GroupSettingsData = {
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
  }
  @Output() participantsAdded = new EventEmitter<void>();
  loggedUserSubscription: Subscription;
  loggedUser: User | null = null;
  searchInputValue = "";
  participants: string[] = [];
  friends: UserInfo[] = [];
  filteredFriends: UserInfo[] = [];
  avatarPreview: string | null = null;
  selectedAvatarFile: File | null = null;
  yourID = "";
  file: File | null = null;
  icons = {
    search: faMagnifyingGlass,
    add: faPlus,
    remove: faMinus
  }
  constructor(private storeService: StoreService, private toastr: ToastrService, private audioService: AudioService) {
    this.loggedUserSubscription = this.storeService.loggedUser$.subscribe(user => {
      this.loggedUser = user;
      if (this.loggedUser) {
        this.yourID = this.loggedUser?._id;
      }
    });
  }

  ngOnInit(): void {
    this.fetchParticipants();
  }

  fetchParticipants() {
    if (this.loggedUser?._id) {
      fetch(`${environment.apiURL}/access/group/${this.loggedUser._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Retrieving friends failed');
          }
          return response.json();
        })
        .then(data => {
          this.friends = data;
          const excludeParticipantsInGroup = this.friends.filter(friend =>
            !this.group.participants.some(participant => participant.id === friend.id)
          );
          this.filteredFriends = excludeParticipantsInGroup;
        })
        .catch(error => {
          this.toastr.error('An Error Occured while retrieving your friends!', 'Friends Error');
          this.audioService.playErrorSound();
          console.error('Friends Error:', error);
        });
    }
  }
  filterFriends() {
    const searchTerm = this.searchInputValue.toLowerCase();
    this.filteredFriends = this.friends.filter(friend =>
      friend.name.toLowerCase().includes(searchTerm) ||
      friend.lastname.toLowerCase().includes(searchTerm) ||
      friend.mail.toLowerCase().includes(searchTerm)
    );
  }

  handleAddParticipant(friendID: string) {
    if (!this.participants.includes(friendID)) {
      this.participants.push(friendID);
    }
  }

  handleRemoveParticipant(friendID: string) {
    this.participants = this.participants.filter(participant => participant !== friendID);
  }

  handleAddParticipants() {
    if (this.participants.length < 1) {
      this.toastr.error('You must add at least one participant!', 'Participants Error');
      this.audioService.playErrorSound();
      return;
    } else {
      fetch(`${environment.apiURL}/group/settings/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ yourID: this.yourID, groupID: this.group.id, participants: this.participants })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Adding participants failed');
          }
          return response.json();
        })
        .then(() => {
          this.participants = [];
          this.participants.push(this.yourID);
          this.toastr.success('You added participants to the group!', 'Participants Added');
          this.audioService.playSuccessSound();
          this.fetchParticipants();
          this.participantsAdded.emit();
        })
        .catch(error => {
          this.toastr.error('An Error Occured while adding participants group!', 'Adding participants failed');
          this.audioService.playErrorSound();
          console.error('Adding participants failed:', error);
        });
    }
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
