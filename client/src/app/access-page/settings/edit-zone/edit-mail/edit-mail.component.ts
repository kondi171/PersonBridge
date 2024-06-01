import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { StoreService } from '../../../../services/store.service';
import { environment } from '../../../../app.environment';
import { AudioService } from '../../../../services/audio.service';

@Component({
  selector: 'app-edit-mail',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './edit-mail.component.html',
  styleUrl: './edit-mail.component.scss'
})
export class EditMailComponent {
  yourID = '';
  newMail = '';
  oldMail = '';
  password = '';

  constructor(private storeService: StoreService, private toastr: ToastrService, private audioService: AudioService) {
    const loggedUser = storeService.getLoggedUser();
    if (loggedUser) {
      this.yourID = loggedUser._id;
      this.oldMail = loggedUser.mail;
    }
  }

  editMail() {
    if (this.newMail === '') {
      this.toastr.error('Mail which you provided is empty!', 'Editing failed');
      this.audioService.playErrorSound();
      return;
    }
    if (this.password === '') {
      this.toastr.error('Password which you provided is empty!', 'Editing failed');
      this.audioService.playErrorSound();
      return;
    }
    if (this.newMail === this.oldMail) {
      this.toastr.error('Mail which you provided is the same as the previous one!', 'Editing failed');
      this.audioService.playErrorSound();
      return;
    }
    fetch(`${environment.apiURL}/settings/mail`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: this.yourID, mail: this.newMail, password: this.password })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error === 'Invalid password!') {
          this.toastr.error('Invalid password!', 'Editing failed');
          this.audioService.playErrorSound();
          return;
        }
        if (data.error === 'The specified mail is already taken!') {
          this.toastr.error('The specified mail is already taken!', 'Editing failed');
          this.audioService.playErrorSound();
          return;
        }
        this.storeService.setLoggedUser(data);
        this.toastr.success(`You changed your email from ${this.oldMail} to ${data.mail}`, 'Editing was successful');
        this.audioService.playSuccessSound();
        this.oldMail = data.mail;
        this.newMail = '';
        this.password = '';
      })
      .catch(error => {
        this.toastr.error('An Error Occured while editing!', 'Editing failed');
        this.audioService.playErrorSound();
        console.error('Edit mail Error:', error);
      });
  }
}