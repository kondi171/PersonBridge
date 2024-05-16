import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { StoreService } from '../../../../services/store.service';
import { environment } from '../../../../app.environment';

@Component({
  selector: 'app-edit-name',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './edit-name.component.html',
  styleUrl: './edit-name.component.scss'
})
export class EditNameComponent {
  yourID = '';
  newName = '';
  oldName = '';
  password = '';

  constructor(private storeService: StoreService, private toastr: ToastrService) {
    const loggedUser = storeService.getLoggedUser();
    if (loggedUser) {
      this.yourID = loggedUser._id;
      this.oldName = loggedUser.name;
    }
  }

  editName() {
    if (this.newName === '') {
      this.toastr.error('Name which you provided is empty!', 'Editing failed');
      return;
    }
    if (this.password === '') {
      this.toastr.error('Password which you provided is empty!', 'Editing failed');
      return;
    }
    if (this.newName === this.oldName) {
      this.toastr.error('Name which you provided is the same as the previous one!', 'Editing failed');
      return;
    }

    fetch(`${environment.apiURL}/settings/name`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: this.yourID, name: this.newName, password: this.password })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error === 'Invalid password!') {
          this.toastr.error('Invalid password!', 'Editing failed');
          return;
        }
        this.storeService.setLoggedUser(data);
        this.toastr.success(`You changed your name from ${this.oldName} to ${data.name}`, 'Editing was successful');
        this.oldName = data.name;
        this.newName = '';
        this.password = '';
      })
      .catch(error => {
        this.toastr.error('An Error Occured while editing!', 'Editing failed');
        console.error('Edit name Error:', error);
      });
  }

}