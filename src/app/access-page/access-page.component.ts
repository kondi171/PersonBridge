import { Component } from '@angular/core';
import { MessageRowComponent } from './message-row/message-row.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-access-page',
  standalone: true,
  imports: [MessageRowComponent, FontAwesomeModule],
  templateUrl: './access-page.component.html',
  styleUrl: './access-page.component.scss'
})
export class AccessPageComponent {
  icons = {
    cog: faCog
  }
}
