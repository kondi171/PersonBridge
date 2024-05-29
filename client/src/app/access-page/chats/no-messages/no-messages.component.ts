import { Component } from '@angular/core';
import { FooterComponent } from '../../../features/footer/footer.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faComments } from '@fortawesome/free-solid-svg-icons';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-no-messages',
  standalone: true,
  imports: [FontAwesomeModule, FooterComponent, RouterModule],
  templateUrl: './no-messages.component.html',
  styleUrl: './no-messages.component.scss'
})
export class NoMessagesComponent {
  icons = {
    section: faComments,
    back: faChevronLeft,
  }
}
