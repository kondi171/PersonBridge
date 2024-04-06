import { Component } from '@angular/core';
import { MessageRowComponent } from './message-row/message-row.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { ChatComponent } from './chat/chat.component';
import { NavbarComponent } from '../side-components/navbar/navbar.component';

@Component({
  selector: 'app-access-page',
  standalone: true,
  imports: [MessageRowComponent, FontAwesomeModule, ChatComponent, NavbarComponent],
  templateUrl: './access-page.component.html',
  styleUrl: './access-page.component.scss'
})
export class AccessPageComponent {
  icons = {
    cog: faCog
  }
}
