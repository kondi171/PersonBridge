import { Component } from '@angular/core';
import { StoreService } from '../../../../services/store.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../app.environment';

@Component({
  selector: 'app-delete-messages',
  standalone: true,
  imports: [],
  templateUrl: './delete-messages.component.html',
  styleUrl: './delete-messages.component.scss'
})
export class DeleteMessagesComponent {
  yourID = "";
  constructor(private storeService: StoreService, private toastr: ToastrService) {
    const loggedUser = storeService.getLoggedUser();
    if (loggedUser) {
      this.yourID = loggedUser._id;
    }
  }

  deleteMessages() {
    fetch(`${environment.apiURL}/settings/messages`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: this.yourID })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          this.toastr.error(data.error, 'Deleting failed');
          return;
        }
        this.toastr.success(`Your messages was deleted!`, 'Delete was successful');

      })
      .catch(error => {
        this.toastr.error('An Error Occured while editing!', 'Deleting failed');
        console.error('Delete Messages Error:', error);
      });
  }
}
