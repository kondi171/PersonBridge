import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Friend } from '../../../typescript/types';
import { StoreService } from '../../../services/store.service';
import { GetUserService } from '../../../services/get-user.service';

@Component({
  selector: 'app-message-row',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './message-row.component.html',
  styleUrl: './message-row.component.scss'
})
export class MessageRowComponent implements OnInit {
  @Input() person!: Friend;
  personID: string = '';
  lastMessage: string = '';
  date: string = '';

  personName: string = '';
  personLastname: string = '';
  personAvatar: string = '';
  personStatus: string = '';

  constructor(private storeService: StoreService, private getUserService: GetUserService) { }

  ngOnInit() {
    this.personID = this.person!.id;
    this.lastMessage = this.person!.messages[this.person.messages.length - 1].content;
    this.date = this.person!.messages[this.person.messages.length - 1].date;
    this.getUserService.getUser(this.personID)
      .then(data => {
        this.personName = data.name;
        this.personLastname = data.lastname;
        this.personAvatar = data.avatar;
        this.personStatus = data.status;
      });
  }
}
