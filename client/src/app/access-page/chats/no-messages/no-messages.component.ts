import { Component } from '@angular/core';
import { FooterComponent } from '../../../features/footer/footer.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faComments } from '@fortawesome/free-solid-svg-icons';
import { RouterModule } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-no-messages',
  standalone: true,
  imports: [FontAwesomeModule, FooterComponent, RouterModule],
  templateUrl: './no-messages.component.html',
  styleUrl: './no-messages.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-in', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class NoMessagesComponent {
  icons = {
    section: faComments,
    back: faChevronLeft,
  }
}
