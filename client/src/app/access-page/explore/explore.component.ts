import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faMagnifyingGlass, faSearch, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FooterComponent } from '../../features/footer/footer.component';
import { PersonRowComponent } from './person-row/person-row.component';
import { Position } from '../../typescript/enums';
import { environment } from '../../app.environment';
import { FormsModule } from '@angular/forms';
import { SearchResult } from '../../typescript/types';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../services/store.service';
import { UpdateUserService } from '../../services/update-user.service';
import { ToastrService } from 'ngx-toastr';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, RouterModule, PersonRowComponent, FooterComponent],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-in', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class ExploreComponent implements OnInit {
  Position = Position;
  searchInputValue: string = '';
  icons = {
    search: faMagnifyingGlass,
    section: faSearch,
    back: faChevronLeft,
    request: faUserPlus
  }
  results: SearchResult[] = [];
  requests: SearchResult[] = [];
  yourID: string = '' as string;
  showResults = true;
  showRequests = false;
  requestCounter: number = 0;
  limit = 20;
  offset = 0;

  constructor(private storeService: StoreService, private updateUser: UpdateUserService, private toastr: ToastrService) {
    const loggedUser = this.storeService.getLoggedUser();
    if (loggedUser) this.yourID = loggedUser._id;
  }

  ngOnInit(): void {
    this.handleSentRequest();
  }

  handleSentRequest() {
    fetch(`${environment.apiURL}/explore/requests/${this.yourID}`, {
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
        this.requests = data;
        this.requestCounter = data.length;
        this.updateUser.updateUser(this.yourID).then(data => {
          this.storeService.setLoggedUser(data);
        }).catch(error => {
          console.error('An Error Occured while user update:', error);
        });
        return data;
      })
      .catch(error => {
        console.error('Internal Server Error:', error);
        throw error;
      });
  }

  handleFindPeople(loadMore = false) {
    if (this.searchInputValue.length === 0) {
      this.toastr.error('Search input is empty!', 'Search failed');
      return;
    }
    fetch(`${environment.apiURL}/explore/find`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ yourID: this.yourID, searchInputValue: this.searchInputValue, limit: this.limit, offset: this.offset })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Internal Server Error');
        }
        return response.json();
      })
      .then(data => {
        if (data.message === 'No users found!') {
          if (loadMore) {
            this.toastr.info('No more users to load.', 'Info');
          } else {
            this.results = [];
          }
        } else {
          this.results = loadMore ? [...this.results, ...data] : data;
          this.offset += this.limit; // Zwiększ offset tylko jeśli załadowano więcej użytkowników
          if (loadMore) {
            this.toastr.success('Loaded more users.', 'Success');
          }
        }
        return data;
      })
      .catch(error => {
        console.error('Internal Server Error:', error);
        throw error;
      });
  }

  loadMoreResults() {
    this.handleFindPeople(true);
  }

  updateRequestCounter(newCounter: number) {
    this.requestCounter = newCounter;
  }
}
