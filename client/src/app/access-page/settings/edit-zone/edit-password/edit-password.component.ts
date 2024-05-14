import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { StoreService } from '../../../../services/store.service';
import { environment } from '../../../../app.environment';

@Component({
  selector: 'app-edit-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './edit-password.component.html',
  styleUrl: './edit-password.component.scss'
})
export class EditPasswordComponent {
  yourID = "";
  oldPassword = "";
  password = "";
  password2 = "";

  constructor(private storeService: StoreService, private toastr: ToastrService) {
    const loggedUser = storeService.getLoggedUser();
    if (loggedUser) {
      this.yourID = loggedUser._id;
      // this.oldPassword = loggedUser.password;
    }
  }

  editPassword() {
    if (this.oldPassword === '') {
      this.toastr.error('Old password which you provided is empty!', 'Editing failed');
      return;
    }
    if (this.password === '') {
      this.toastr.error('New password which you provided is empty!', 'Editing failed');
      return;
    }
    if (this.password !== this.password2) {
      this.toastr.error("Password must match!", "Editing failed");
      return;
    }
    if (this.password.length < 6) {
      this.toastr.error("Password must be at least 6 characters long!", "Editing failed");
      return;
    }

    fetch(`${environment.apiUrl}/settings/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: this.yourID, password: this.password, oldPassword: this.oldPassword })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          this.toastr.error(data.error, 'Editing failed');
          return;
        }
        this.storeService.setLoggedUser(data);
        this.toastr.success('You changed your password with success!', 'Editing was successful');
        this.oldPassword = '';
        this.password = '';
        this.password2 = '';
      })
      .catch(error => {
        this.toastr.error('An Error Occured while editing!', 'Editing failed');
        console.error('Edit password Error:', error);
      });
  }
}
