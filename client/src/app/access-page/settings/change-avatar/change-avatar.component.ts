import { Component } from '@angular/core';
import { environment } from '../../../app.environment';
import { StoreService } from '../../../services/store.service';
import { ToastrService } from 'ngx-toastr';

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
  constructor(private storeService: StoreService, private toastr: ToastrService) {
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

      fetch(`${environment.apiUrl}/settings/avatar/${this.yourID}`, {
        method: 'POST',
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          this.toastr.success('Avatar uploaded successfully!', 'Success');
          fetch(`${environment.apiUrl}/access/user/${this.yourID}`, {
            method: 'GET',
          })
            .then(response => response.json())
            .then(data => {
              this.storeService.setLoggedUser(data);
              this.avatar = data.avatar;
            })
            .catch(error => {
              this.toastr.error('An Error Occured while changing avatar!', 'Avatar upload error');
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

}
