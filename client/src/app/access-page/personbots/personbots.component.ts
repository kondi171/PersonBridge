import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBrain, faChevronLeft, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FooterComponent } from '../../features/footer/footer.component';
import { Position } from '../../typescript/enums';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-personbots',
  standalone: true,
  imports: [FontAwesomeModule, RouterModule, FooterComponent],
  templateUrl: './personbots.component.html',
  styleUrl: './personbots.component.scss'
})
export class personbotsComponent {
  Position = Position;

  icons = {
    section: faBrain,
    back: faChevronLeft,
  }
}
