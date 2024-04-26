import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBrain, faChevronLeft, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FooterComponent } from '../../side-components/footer/footer.component';
import { Position } from '../../typescript/enums';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-chatbots',
  standalone: true,
  imports: [FontAwesomeModule, RouterModule, FooterComponent],
  templateUrl: './chatbots.component.html',
  styleUrl: './chatbots.component.scss'
})
export class ChatbotsComponent {
  Position = Position;

  icons = {
    section: faBrain,
    back: faChevronLeft,
  }
}
