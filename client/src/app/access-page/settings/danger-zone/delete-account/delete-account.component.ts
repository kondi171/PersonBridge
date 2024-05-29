import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../../../services/store.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../app.environment';
import { SocketService } from '../../../../services/socket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-delete-account',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './delete-account.component.html',
  styleUrl: './delete-account.component.scss'
})
export class DeleteAccountComponent {
  password = "";
  yourID = "";

  constructor(private storeService: StoreService, private toastr: ToastrService, private socketService: SocketService, private router: Router) {
    const loggedUser = storeService.getLoggedUser();
    if (loggedUser) {
      this.yourID = loggedUser._id;
    }
  }

  deleteAccount() {
    if (this.password === '') {
      this.toastr.error('Password which you provided is empty!', 'Delete failed');
      return;
    }
    fetch(`${environment.apiURL}/settings/account`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: this.yourID, password: this.password })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          this.toastr.error(data.error, 'Delete failed');
          return;
        }
        this.storeService.removeLoggedUser();
        this.socketService.disconnect();
        this.router.navigate(['/login']);
        this.toastr.error('You have successfully removed your Account!', 'Delete Successful');
      })
      .catch(error => {
        this.toastr.error('An Error Occured while deleting!', 'Delete failed');
        console.error('Delete Account Error:', error);
      });
  }
}
