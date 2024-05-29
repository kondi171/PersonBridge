import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleCheck, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { UserInfo } from '../../../typescript/types';
import { environment } from '../../../app.environment';
import { StoreService } from '../../../services/store.service';
import { ToastrService } from 'ngx-toastr';
import { FullName } from '../../../typescript/types';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-person-row',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './person-row.component.html',
  styleUrls: ['./person-row.component.scss']
})

export class PersonRowComponent implements OnInit {
  @Input() person: UserInfo = {
    id: '',
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

  yourID: string = '';
  yourRequests: string[] = [];

  constructor(
    private storeService: StoreService,
    private socketService: SocketService,
    private toastr: ToastrService
  ) {
    const loggedUser = this.storeService.getLoggedUser();
    if (loggedUser) {
      this.yourID = loggedUser._id;
    }
  }

  ngOnInit(): void {
    this.getSentRequest();
    const timestamp = new Date().getTime();
    this.person.avatar = this.ensureFullURL(this.person.avatar) + `?${timestamp}`;
    this.socketService.onAcceptRequest(() => {
      this.getSentRequest();
    });
    this.socketService.onIgnoreRequest(() => {
      this.getSentRequest();
    });
  }

  getSentRequest() {
    fetch(`${environment.apiURL}/explore/requests/sent/${this.yourID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Internal Server Error');
        }
        return response.json();
      })
      .then(data => {
        this.yourRequests = data;
      })
      .catch(error => {
        console.error('Internal Server Error:', error);
        throw error;
      });
  }

  handleSendRequest(fullname: FullName) {
    this.yourRequests.push(this.person.id);
    this.requestCounter++;
    this.requestCounterChange.emit(this.requestCounter);
    fetch(`${environment.apiURL}/explore/request`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ yourID: this.yourID, personID: this.person.id })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Internal Server Error');
        }
        this.toastr.success('Request Sent!', `${fullname.name} ${fullname.lastname}`);
        return response.json();
      })
      .catch(error => {
        console.error('Internal Server Error:', error);
        this.toastr.error('Internal Server Error!', 'Error');
        throw error;
      });
  }


  handleCancelRequest(fullname: FullName) {
    const indexToRemove = this.yourRequests.indexOf(this.person.id);
    if (indexToRemove !== -1) {
      this.yourRequests.splice(indexToRemove, 1);
      this.requestCounter--;
      this.requestCounterChange.emit(this.requestCounter);
    }
    fetch(`${environment.apiURL}/explore/request`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ yourID: this.yourID, personID: this.person.id })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Internal Server Error');
        }

        this.toastr.warning('Request Canceled!', `${fullname.name} ${fullname.lastname}`);
        return response.json();
      })
      .catch(error => {
        console.error('Internal Server Error:', error);
        this.toastr.error('Internal Server Error!', 'Error');
        throw error;
      });
  }

  onImageError(event: any) {
    event.target.src = './../../../../assets/img/Blank-Avatar.jpg';
  }

  ensureFullURL(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${environment.serverURL}/${path}`;
  }
}
