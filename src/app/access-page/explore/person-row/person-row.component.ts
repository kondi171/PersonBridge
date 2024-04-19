import { Component, Input, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleCheck, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-person-row',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './person-row.component.html',
  styleUrl: './person-row.component.scss'
})
export class PersonRowComponent implements OnInit {
  @Input() person: string = "";
  @Input() avatarSrc: string = "";
  @Input() requestSent: boolean = false;
  innerRequestSent: boolean = false;
  icons = {
    request: faPaperPlane,
    sent: faCircleCheck,
  }

  ngOnInit() {
    this.innerRequestSent = this.requestSent; // Synchronizacja innerRequestSent z requestSent
  }

  handleRequest() {
    this.requestSent = !this.requestSent;
    this.innerRequestSent = this.requestSent; // Aktualizacja innerRequestSent
  }
}
