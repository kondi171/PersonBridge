import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faMagnifyingGlass, faSearch, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FooterComponent } from '../../features/footer/footer.component';
import { PersonRowComponent } from './person-row/person-row.component';
import { Position } from '../../typescript/enums';
import { environment } from '../../app.environment';
import { FormsModule } from '@angular/forms';
import { SearchResult } from '../../typescript/interfaces';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../services/store.service';
import { UpdateUserService } from '../../services/update-user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, RouterModule, PersonRowComponent, FooterComponent],
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.scss'
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

  constructor(private storeService: StoreService, private updateUser: UpdateUserService, private toastr: ToastrService) {
    const loggedUser = this.storeService.getLoggedUser();
    if (loggedUser) this.yourID = loggedUser._id;
  }

  ngOnInit(): void {
    this.handleSentRequest();
  }

  handleSentRequest() {
    fetch(`${environment.apiUrl}/explore/requests/${this.yourID}`, {
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

  handleFindPeople() {
    if (this.searchInputValue.length === 0) {
      this.toastr.error('Search input is empty!', 'Search failed');
      return;
    }
    fetch(`${environment.apiUrl}/explore/find`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ yourID: this.yourID, searchInputValue: this.searchInputValue })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Internal Server Error');
        }
        return response.json();
      })
      .then(data => {
        if (data.message === 'No users found!') this.results = [];
        else this.results = data;
        return data;
      })
      .catch(error => {
        console.error('Internal Server Error:', error);
        throw error;
      });
  }
  updateRequestCounter(newCounter: number) {
    this.requestCounter = newCounter;
  }
}