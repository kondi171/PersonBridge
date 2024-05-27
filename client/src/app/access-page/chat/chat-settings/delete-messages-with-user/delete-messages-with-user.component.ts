import { Component, Input } from '@angular/core';
import { StoreService } from '../../../../services/store.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../app.environment';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-delete-messages',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './delete-messages-with-user.component.html',
  styleUrl: './delete-messages-with-user.component.scss'
})
export class DeleteMessagesWithUserComponent {
  @Input() friendID: string = '';
  yourID = "";
  password = "";
  constructor(private storeService: StoreService, private toastr: ToastrService) {
    const loggedUser = storeService.getLoggedUser();
    if (loggedUser) {
      this.yourID = loggedUser._id;
    }
  }

  deleteMessages() {
    if (this.password === '') {
      this.toastr.error('Password which you provided is empty!', 'Delete failed');
      return;
    }
    fetch(`${environment.apiURL}/chat-settings/messages`, {
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
          return;
        }
        this.toastr.success(`Your messages was deleted!`, 'Delete was successful');
        this.password = '';
        this.storeService.forceRefreshMessages(true);
      })
      .catch(error => {
        this.toastr.error('An Error Occured while deleting messages!', 'Delete Error');
        console.error('Delete Error:', error);
      });
  }
}

