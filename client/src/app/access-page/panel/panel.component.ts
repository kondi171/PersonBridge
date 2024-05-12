import { Component, Input, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { MessageRowComponent } from './message-row/message-row.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, Observable } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from "../../side-components/navbar/navbar.component";
import { Device } from '../../typescript/enums';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../services/store.service';
import { Friend } from '../../typescript/types';

@Component({
  selector: 'app-panel',
  standalone: true,
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
  imports: [
    CommonModule,
    MessageRowComponent,
    FontAwesomeModule,
    RouterModule,
    NavbarComponent
  ]
})
export class PanelComponent {
  Device = Device;
  @Input() device: Device = Device.DESKTOP;
  name: string = '';
  lastname: string = '';
  friends: Friend[] = [];
  avatar: string = '';
  status: string = '';
  icons = {
    cog: faCog
  };

  constructor(private router: Router, private storeService: StoreService) {
    if (storeService.getLoggedUser()) {
      this.name = storeService.getLoggedUser()!.name;
      this.lastname = storeService.getLoggedUser()!.lastname;
      this.status = storeService.getLoggedUser()!.status;
      this.avatar = storeService.getLoggedUser()!.avatar;
      this.friends = storeService.getLoggedUser()!.friends;
    }
  }
  showMessages(id: string) {
    this.storeService.setActiveChatID(id);
    this.router.navigate(['/access/chat', id]);
  }
}