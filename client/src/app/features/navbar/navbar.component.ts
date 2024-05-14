import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCog, faUsers, faComments, faSearch, faBrain } from '@fortawesome/free-solid-svg-icons';
import { Device } from '../../typescript/enums';
import { StoreService } from '../../services/store.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  Device = Device;
  @Input() device = Device.DESKTOP;
  chatID: string = '';

  constructor(private storeService: StoreService, private router: Router) {
    this.chatID = storeService.getActiveChatID();
  }

  get isChatActive(): boolean {
    const path = this.router.url;
    const chat = path.slice(0, 13)
    if (chat === '/access/chat/') return true;
    else return false;
  }

  icons = {
    chats: faComments,
    friends: faUsers,
    explore: faSearch,
    chatbots: faBrain,
    settings: faCog,
  }
}
