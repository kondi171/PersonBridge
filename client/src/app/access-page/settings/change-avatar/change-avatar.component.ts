import { Component } from '@angular/core';
import { environment } from '../../../app.environment';
import { StoreService } from '../../../services/store.service';
import { ToastrService } from 'ngx-toastr';
import { AudioService } from '../../../services/audio.service';

@Component({
  selector: 'app-change-avatar',
  standalone: true,
  imports: [],
  templateUrl: './change-avatar.component.html',
  styleUrls: ['./change-avatar.component.scss']
})
export class ChangeAvatarComponent {
  yourID = '';
  avatar = '';
  constructor(private storeService: StoreService, private toastr: ToastrService, private audioService: AudioService) {
    const loggedUser = storeService.getLoggedUser();
    if (loggedUser) {
      this.yourID = loggedUser._id;
      this.avatar = loggedUser.avatar;
    }
  }

  uploadAvatar(event: Event) {

    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files ? fileInput.files[0] : null;

    if (file) {
      const formData = new FormData();
      formData.append('avatar', file);

      fetch(`${environment.apiURL}/settings/avatar/${this.yourID}`, {
        method: 'POST',
        body: formData
      })
        .then(response => response.json())
        .then(() => {
          this.toastr.success('Avatar uploaded successfully!', 'Success');
          this.audioService.playSuccessSound();
          fetch(`${environment.apiURL}/access/user/${this.yourID}`, {
            method: 'GET',
          })
            .then(response => response.json())
            .then(data => {
              this.storeService.setLoggedUser(data);
              this.avatar = data.avatar;
            })
            .catch(error => {
              this.toastr.error('An Error Occured while changing avatar!', 'Avatar upload error');
              this.audioService.playErrorSound();
              console.error('Avatar upload error:', error);
            })
        })
        .catch(error => {
          this.toastr.error('An Error Occured while uploading avatar!', 'Avatar upload error');
          this.audioService.playErrorSound();
          console.error('Avatar upload error:', error);
        });
    } else {
      this.toastr.error('Please select a file to upload!', 'No File Selected');
      this.audioService.playErrorSound();
    }
  }
  onImageError(event: any) {
    event.target.src = './../../../../assets/img/Blank-Avatar.jpg';
  }
}
