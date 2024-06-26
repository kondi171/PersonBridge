import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { StoreService } from '../../../../services/store.service';
import { environment } from '../../../../app.environment';
import { AudioService } from '../../../../services/audio.service';

@Component({
  selector: 'app-edit-lastname',
  standalone: true,
  imports: [FormsModule],

  templateUrl: './edit-lastname.component.html',
  styleUrl: './edit-lastname.component.scss'
})
export class EditLastnameComponent {
  yourID = '';
  newLastname = '';
  oldLastname = '';
  password = '';

  constructor(private storeService: StoreService, private toastr: ToastrService, private audioService: AudioService) {
    const loggedUser = storeService.getLoggedUser();
    if (loggedUser) {
      this.yourID = loggedUser._id;
      this.oldLastname = loggedUser.lastname;
    }
  }

  editLastname() {
    if (this.newLastname === '') {
      this.toastr.error('Lastname which you provided is empty!', 'Editing failed');
      this.audioService.playErrorSound();
      return;
    }
    if (this.password === '') {
      this.toastr.error('Password which you provided is empty!', 'Editing failed');
      this.audioService.playErrorSound();
      return;
    }
    if (this.newLastname === this.oldLastname) {
      this.toastr.error('Lastname which you provided is the same as the previous one!', 'Editing failed');
      this.audioService.playErrorSound();
      return;
    }
    fetch(`${environment.apiURL}/settings/lastname`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: this.yourID, lastname: this.newLastname, password: this.password })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error === 'Invalid password!') {
          this.toastr.error('Invalid password!', 'Editing failed');
          this.audioService.playErrorSound();
          return;
        }
        this.storeService.setLoggedUser(data);
        this.toastr.success(`You changed your lastname from ${this.oldLastname} to ${data.lastname}`, 'Editing was successful');
        this.audioService.playSuccessSound();
        this.oldLastname = data.lastname;
        this.newLastname = '';
        this.password = '';
      })
      .catch(error => {
        this.toastr.error('An Error Occured while editing!', 'Editing failed');
        this.audioService.playErrorSound();
        console.error('Edit lastname Error:', error);
      });
  }
}
