import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActiveState, Device } from '../typescript/enums';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MessageRowComponent } from './panel/message-row/message-row.component';
import { ChatComponent } from './chat/chat.component';
import { NavbarComponent } from '../side-components/navbar/navbar.component';
import { PeopleComponent } from './people/people.component';
import { ExploreComponent } from './explore/explore.component';
import { SettingsComponent } from './settings/settings.component';
import { PanelComponent } from './panel/panel.component';
import { ModalComponent } from '../side-components/modal/modal.component';
import { SomeonesAudioComponent } from './modal-content/someones-audio/someones-audio.component';
import { YourAudioComponent } from './modal-content/your-audio/your-audio.component';
import { SomeonesVideoComponent } from './modal-content/someones-video/someones-video.component';
import { YourVideoComponent } from './modal-content/your-video/your-video.component';
import { PINComponent } from './modal-content/pin/pin.component';

@Component({
  selector: 'app-access-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MessageRowComponent,
    NavbarComponent,
    PanelComponent,
    ChatComponent,
    PeopleComponent,
    ExploreComponent,
    SettingsComponent,
    ModalComponent,
    SomeonesAudioComponent,
    YourAudioComponent,
    SomeonesVideoComponent,
    YourVideoComponent,
    PINComponent,
  ],
  templateUrl: './access-page.component.html',
  styleUrls: ['./access-page.component.scss']
})
export class AccessPageComponent implements OnInit {
  isMobile = false;
  isModalVisible = true;
  device = Device.DESKTOP;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.checkScreenWidth();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkScreenWidth();
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenWidth();
  }

  checkScreenWidth() {
    const path = this.router.url;
    if (path === ActiveState.PANEL || window.innerWidth >= 1024) this.isMobile = true;
    else this.isMobile = false;
    if (window.innerWidth >= 1024) this.device = Device.DESKTOP;
    else this.device = Device.MOBILE;
  }

  openModal() {
    this.isModalVisible = true;
  }

  closeModal() {
    this.isModalVisible = false;
  }
}