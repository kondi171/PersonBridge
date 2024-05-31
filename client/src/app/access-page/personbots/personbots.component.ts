import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBrain, faChevronLeft, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FooterComponent } from '../../features/footer/footer.component';
import { Position } from '../../typescript/enums';
import { RouterModule } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-personbots',
  standalone: true,
  imports: [FontAwesomeModule, RouterModule, FooterComponent],
  templateUrl: './personbots.component.html',
  styleUrl: './personbots.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-in', style({ opacity: 1 }))
      ])
    ]),
  ]
})
export class personbotsComponent {
  Position = Position;

  icons = {
    section: faBrain,
    back: faChevronLeft,
  }
}
