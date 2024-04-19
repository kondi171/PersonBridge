import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faMagnifyingGlass, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FooterComponent } from '../../side-components/footer/footer.component';
import { PersonRowComponent } from './person-row/person-row.component';
import { Position } from '../../typescript/enums';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [FontAwesomeModule, RouterModule, PersonRowComponent, FooterComponent],
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.scss'
})
export class ExploreComponent {
  Position = Position;
  icons = {
    search: faMagnifyingGlass,
    section: faSearch,
    back: faChevronLeft,
  }
}
