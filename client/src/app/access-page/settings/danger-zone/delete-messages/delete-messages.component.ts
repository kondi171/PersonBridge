import { Component, Input } from '@angular/core';
import { StoreService } from '../../../../services/store.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../app.environment';
import { FormsModule } from '@angular/forms';
import { AudioService } from '../../../../services/audio.service';

@Component({
  selector: 'app-delete-messages',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './delete-messages.component.html',
  styleUrl: './delete-messages.component.scss'
})
export class DeleteMessagesComponent {
  yourID = "";
  password = "";
  constructor(private storeService: StoreService, private toastr: ToastrService, private audioService: AudioService) {
    const loggedUser = storeService.getLoggedUser();
    if (loggedUser) {
      this.yourID = loggedUser._id;
    }
  }

  deleteMessages() {
    if (this.password === '') {
      this.toastr.error('Password which you provided is empty!', 'Delete failed');
      this.audioService.playErrorSound();
      return;
    }
    fetch(`${environment.apiURL}/settings/messages`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: this.yourID, password: this.password })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          this.toastr.error(data.error, 'Deleting failed');
          this.audioService.playErrorSound();
          return;
        }
        this.toastr.success(`Your messages was deleted!`, 'Delete was successful');
        this.audioService.playSuccessSound();
        this.password = '';
      })
      .catch(error => {
        this.toastr.error('An Error Occured while deleting messages!', 'Deleting failed');
        this.audioService.playErrorSound();
        console.error('Delete Messages Error:', error);
      });
  }
}
