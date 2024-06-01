import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { StoreService } from '../../../../../services/store.service';
import { environment } from '../../../../../app.environment';
import { GroupSettingsData } from '../../../../../typescript/interfaces';
import { AudioService } from '../../../../../services/audio.service';

@Component({
  selector: 'app-change-group-name',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './change-group-name.component.html',
  styleUrls: ['./change-group-name.component.scss']
})
export class ChangeGroupNameComponent implements OnInit {
  @Input() group: GroupSettingsData | null = null;
  @Output() groupNameChanged = new EventEmitter<void>();

  yourID = '';
  newName = '';
  oldName = '';
  password = '';

  constructor(private storeService: StoreService, private toastr: ToastrService, private audioService: AudioService) { }

  ngOnInit(): void {
    const loggedUser = this.storeService.getLoggedUser();
    if (loggedUser) {
      this.yourID = loggedUser._id;
    }
    if (this.group) {
      this.oldName = this.group.name;
    }
  }

  editName() {
    if (this.newName === '') {
      this.toastr.error('Name which you provided is empty!', 'Editing failed');
      this.audioService.playErrorSound();
      return;
    }
    if (this.password === '') {
      this.toastr.error('Password which you provided is empty!', 'Editing failed');
      this.audioService.playErrorSound();
      return;
    }
    if (this.newName === this.oldName) {
      this.toastr.error('Name which you provided is the same as the previous one!', 'Editing failed');
      this.audioService.playErrorSound();
      return;
    }
    fetch(`${environment.apiURL}/group/settings/name`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ yourID: this.yourID, groupID: this.group?.id, participants: this.group?.participants, name: this.newName, password: this.password })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error === 'Invalid password!') {
          this.toastr.error('Invalid password!', 'Editing failed');
          this.audioService.playErrorSound();
          return;
        }
        this.toastr.success(`You changed name of the group from ${this.oldName} to ${this.newName}`, 'Editing was successful');
        this.audioService.playSuccessSound();
        this.oldName = data.name;
        this.newName = '';
        this.password = '';
        this.groupNameChanged.emit();
      })
      .catch(error => {
        this.toastr.error('An Error Occured while editing!', 'Editing failed');
        this.audioService.playErrorSound();
        console.error('Edit name Error:', error);
      });
  }
}
