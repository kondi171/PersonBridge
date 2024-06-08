import { Component, Input } from '@angular/core';
import { StoreService } from '../../../../../services/store.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../../app.environment';
import { FormsModule } from '@angular/forms';
import { AudioService } from '../../../../../services/audio.service';

@Component({
  selector: 'app-delete-messages-with-bot',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './delete-messages-with-bot.component.html',
  styleUrl: './delete-messages-with-bot.component.scss'
})
export class DeleteMessagesWithBotComponent {
  @Input() chatbotID: string = '';
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
    fetch(`${environment.apiURL}/bot/settings/messages`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ yourID: this.yourID, chatbotID: this.chatbotID, password: this.password })
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'Invalid password') {
          this.toastr.error(data.message, 'Deleting failed');
          this.audioService.playErrorSound();
          return;
        }
        this.toastr.success(`Your messages was deleted!`, 'Delete was successful');
        this.audioService.playSuccessSound();
        this.password = '';
        this.storeService.forceRefreshMessages(true);
      })
      .catch(error => {
        this.toastr.error('An Error Occured while deleting messages!', 'Delete Error');
        this.audioService.playErrorSound();
        console.error('Delete Error:', error);
      });
  }
}