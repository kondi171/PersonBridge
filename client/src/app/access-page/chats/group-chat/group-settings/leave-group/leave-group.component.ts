import { Component, Input } from '@angular/core';
import { StoreService } from '../../../../../services/store.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../../app.environment';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-leave-group',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './leave-group.component.html',
  styleUrl: './leave-group.component.scss'
})
export class LeaveGroupComponent {
  @Input() groupID: string = '';
  yourID = "";
  password = "";
  constructor(private storeService: StoreService, private toastr: ToastrService, private router: Router) {
    const loggedUser = storeService.getLoggedUser();
    if (loggedUser) {
      this.yourID = loggedUser._id;
    }
  }

  handleLeaveGroup() {
    if (this.password === '') {
      this.toastr.error('Password which you provided is empty!', 'Delete failed');
      return;
    }
    fetch(`${environment.apiURL}/group/settings/leave`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ yourID: this.yourID, groupID: this.groupID, password: this.password })
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'Invalid password') {
          this.toastr.error(data.message, 'Leaving group was failure');
          return;
        }
        this.toastr.success(`You leave the group!`, 'Success');
        this.password = '';
        this.router.navigate(['/access']);
      })
      .catch(error => {
        this.toastr.error('An Error Occured while leaving group!', 'Leave Error');
        console.error('Delete Error:', error);
      });
  }
}

