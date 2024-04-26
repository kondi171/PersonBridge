import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCog, faUsers, faComments, faSearch, faBrain } from '@fortawesome/free-solid-svg-icons';
import { Device } from '../../typescript/enums';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FontAwesomeModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  Device = Device;
  @Input() device = Device.DESKTOP;

  icons = {
    chats: faComments,
    friends: faUsers,
    explore: faSearch,
    chatbots: faBrain,
    settings: faCog,
  }
}
