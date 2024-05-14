import { Component, Input, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { MessageRowComponent } from './message-row/message-row.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, Observable, Subscription } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from "../../features/navbar/navbar.component";
import { Device } from '../../typescript/enums';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../services/store.service';
import { Friend, User } from '../../typescript/types';
import { environment } from '../../app.environment';

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
  subscription: Subscription;
  loggedUser: User | null = null;
  Device = Device;
  @Input() device: Device = Device.DESKTOP;
  icons = {
    cog: faCog
  };

  constructor(private router: Router, private storeService: StoreService) {

    this.subscription = this.storeService.user$.subscribe(user => {
      this.loggedUser = user;
      if (this.loggedUser?.avatar) {
        const timestamp = new Date().getTime();
        this.loggedUser.avatar = this.ensureFullURL(this.loggedUser.avatar) + `?${timestamp}`;
      }
    });


  }
  showMessages(id: string) {
    this.storeService.setActiveChatID(id);
    this.router.navigate(['/access/chat', id]);
  }
  ensureFullURL(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path; // Jest już pełnym URL-em
    }
    return `${environment.serverURL}/${path}`; // Dodaj bazowy URL serwera
  }

}
