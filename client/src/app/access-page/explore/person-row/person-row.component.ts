import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleCheck, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { SearchResult } from '../../../typescript/interfaces';
import { environment } from '../../../app.environment';
import { StoreService } from '../../../services/store.service';
import { UpdateUserService } from '../../../services/update-user.service';
import { ToastrService } from 'ngx-toastr';
import { FullName } from '../../../typescript/types';

@Component({
  selector: 'app-person-row',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './person-row.component.html',
  styleUrl: './person-row.component.scss'
})
export class PersonRowComponent {
  @Input() person: SearchResult = {
    _id: '',
    name: '',
    lastname: '',
    mail: '',
    avatar: '',
  };
  @Input() requestCounter: number = 0;
  @Output() requestCounterChange = new EventEmitter<number>();
  icons = {
    request: faPaperPlane,
    sent: faCircleCheck,
  }
  yourRequests: string[] = [];
  yourID: string = '';

  constructor(private storeService: StoreService, private updateUser: UpdateUserService, private toastr: ToastrService) {
    const loggedUser = this.storeService.getLoggedUser();
    if (loggedUser) {
      this.yourID = loggedUser._id;
      this.yourRequests = loggedUser.requests.sent;
    }
  }


  handleSendRequest(fullname: FullName) {
    this.yourRequests.push(this.person._id);
    this.requestCounter++;
    this.requestCounterChange.emit(this.requestCounter);
    fetch(`${environment.apiUrl}/explore/request`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ yourID: this.yourID, personID: this.person._id })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Internal Server Error');
        }
        this.updateUser.updateUser(this.yourID).then(data => {
          this.storeService.setLoggedUser(data);
          this.yourID = this.storeService.getLoggedUser().id;
        }).catch(error => {
          console.error('An Error Occured while user update:', error);
          this.toastr.error('An Error Occured while user update!', 'Error');
        });
        this.toastr.info('Request Sent!', `${fullname.name} ${fullname.lastname}`);
        return response.json();
      })
      .catch(error => {
        console.error('Internal Server Error:', error);
        this.toastr.error('Internal Server Error!', 'Error');
        throw error;
      });
  }
  handleCancelRequest(fullname: FullName) {
    const indexToRemove = this.yourRequests.indexOf(this.person._id);
    this.requestCounter--;
    this.requestCounterChange.emit(this.requestCounter);
    if (indexToRemove !== -1) {
      this.yourRequests.splice(indexToRemove, 1);
    }
    fetch(`${environment.apiUrl}/explore/request`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ yourID: this.yourID, personID: this.person._id })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Internal Server Error');
        }
        this.updateUser.updateUser(this.yourID).then(data => {
          this.storeService.setLoggedUser(data);
        }).catch(error => {
          console.error('An Error Occured while user update:', error);
          this.toastr.error('An Error Occured while user update!', 'Error');
        });
        this.toastr.warning('Request Canceled!', `${fullname.name} ${fullname.lastname}`);
        return response.json();
      })
      .catch(error => {
        console.error('Internal Server Error:', error);
        this.toastr.error('Internal Server Error!', 'Error');
        throw error;
      });
  }
}
