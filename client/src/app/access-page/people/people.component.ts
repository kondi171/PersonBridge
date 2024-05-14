import { Component } from '@angular/core';
import { CardComponent } from './card/card.component';
import { CardType } from '../../typescript/enums';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FooterComponent } from '../../features/footer/footer.component';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-people',
  standalone: true,
  imports: [FontAwesomeModule, RouterModule, CardComponent, FooterComponent],
  templateUrl: './people.component.html',
  styleUrl: './people.component.scss'
})
export class PeopleComponent {
  cardType = CardType;
  icons = {
    section: faUsers,
    back: faChevronLeft,
  }
}
