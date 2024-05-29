import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { User } from '../../../typescript/interfaces';
import { StoreService } from '../../../services/store.service';
import { environment } from '../../../app.environment';
import { ToastrService } from 'ngx-toastr';
import { UserInfo } from '../../../typescript/types';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-group',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.scss']
})
export class CreateGroupComponent implements OnInit {
  loggedUserSubscription: Subscription;
  loggedUser: User | null = null;
  searchInputValue = "";
  groupName = "";
  participants: string[] = [];
  friends: UserInfo[] = [];
  filteredFriends: UserInfo[] = [];
  avatarPreview: string | null = null;
  selectedAvatarFile: File | null = null;
  groupID = "";
  yourID = "";
  file: File | null = null;
  icons = {
    search: faMagnifyingGlass,
    add: faPlus,
    remove: faMinus
  }

  constructor(private storeService: StoreService, private toastr: ToastrService) {
    this.loggedUserSubscription = this.storeService.loggedUser$.subscribe(user => {
      this.loggedUser = user;
      if (this.loggedUser) {
        this.participants.push(this.loggedUser?._id);
        this.yourID = this.loggedUser?._id;
      }
    });
  }

  ngOnInit(): void {
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
          this.filteredFriends = data;
        })
        .catch(error => {
          this.toastr.error('An Error Occured while retrieving your friends!', 'Friends Error');
          console.error('Friends Error:', error);
        });
    }
  }

  uploadAvatar(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedAvatarFile = file;

      const reader = new FileReader();
      reader.onload = e => this.avatarPreview = reader.result as string;
      reader.readAsDataURL(file);
      const fileInput = event.target as HTMLInputElement;
      this.file = fileInput.files ? fileInput.files[0] : null;
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

  handleCreateGroup() {
    if (this.groupName.trim().length === 0) {
      this.toastr.error('The Group name cannot be empty!', 'Group Name Error');
      return;
    } else if (this.groupName.length < 3) {
      this.toastr.error('The Group name must be at least 3 characters long!', 'Group Name Error');
      return;
    }
    if (this.participants.length < 3) {
      this.toastr.error('The group must have a minimum of 3 participants, including you!', 'Participants Error');
      return;
    }
    else {
      fetch(`${environment.apiURL}/access/group`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: this.groupName, avatar: this.avatarPreview, participants: this.participants })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Creating Group failed');
          }
          return response.json();
        })
        .then(data => {
          this.groupName = '';
          this.avatarPreview = '';
          this.participants = [];
          this.participants.push(this.yourID);
          this.toastr.success('The group was created!', 'Group Created');
          this.groupID = data.id;
          this.uploadAvatarToTheServer();
        })
        .catch(error => {
          this.toastr.error('An Error Occured while creating group!', 'Creating Group failed');
          console.error('Creating Group failed:', error);
        });
    }
  }

  uploadAvatarToTheServer() {
    if (this.file) {
      const formData = new FormData();
      formData.append('avatar', this.file);
      fetch(`${environment.apiURL}/access/group/${this.groupID}`, {
        method: 'POST',
        body: formData
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Upload Avatar Group failed');
          }
          return response.json();
        })
        .catch(error => {
          this.toastr.error('An Error Occured while uploading avatar group!', 'Upload Avatar Group failed');
          console.error('Upload Avatar Group failed:', error);
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
