import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../../../../services/store.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../../app.environment';
import { SocketService } from '../../../../../services/socket.service';
import { Router } from '@angular/router';
import { AudioService } from '../../../../../services/audio.service';

@Component({
  selector: 'app-remove-friend',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './remove-friend.component.html',
  styleUrl: './remove-friend.component.scss'
})
export class RemoveFriendComponent {
  @Input() friendID: string = '';
  yourID = "";
  password = "";

  constructor(private storeService: StoreService, private toastr: ToastrService, private socketService: SocketService, private router: Router, private audioService: AudioService) {
    const loggedUser = storeService.getLoggedUser();
    if (loggedUser) {
      this.yourID = loggedUser._id;
    }
  }

  removeFriend() {
    if (this.password === '') {
      this.toastr.error('Password which you provided is empty!', 'Delete failed');
      this.audioService.playErrorSound();
      return;
    }
    fetch(`${environment.apiURL}/user/settings/friend`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ yourID: this.yourID, friendID: this.friendID, password: this.password })
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'Invalid password') {
          this.toastr.error(data.message, 'Deleting failed');
          this.audioService.playErrorSound();
          return;
        }
        this.toastr.success('You have successfully removed friend!', 'Remove Successful');
        this.audioService.playSuccessSound();
        this.password = '';
        this.storeService.forceRefreshMessages(true);
        this.router.navigate(['/access']);
      })
      .catch(error => {
        this.toastr.error('An Error Occured while removing!', 'Remove failed');
        this.audioService.playErrorSound();
        console.error('Remove Friend Error:', error);
      });
  }
}
