import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActiveState, Device } from '../typescript/enums';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MessageRowComponent } from './panel/message-row/message-row.component';
import { NavbarComponent } from '../features/navbar/navbar.component';
import { PeopleComponent } from './people/people.component';
import { ExploreComponent } from './explore/explore.component';
import { SettingsComponent } from './settings/settings.component';
import { PanelComponent } from './panel/panel.component';

import { ModalComponent } from '../features/modal-wrapper/modal-wrapper.component';
import { SomeonesAudioComponent } from './modals/someones-audio/someones-audio.component';
import { YourAudioComponent } from './modals/your-audio/your-audio.component';
import { SomeonesVideoComponent } from './modals/someones-video/someones-video.component';
import { YourVideoComponent } from './modals/your-video/your-video.component';
import { StoreService } from '../services/store.service';
import { LoaderComponent } from '../features/loader/loader.component';
import { faBrain, faPhone, faSearch, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-access-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FontAwesomeModule,
    MessageRowComponent,
    NavbarComponent,
    PanelComponent,
    PeopleComponent,
    ExploreComponent,
    SettingsComponent,
    ModalComponent,
    SomeonesAudioComponent,
    YourAudioComponent,
    SomeonesVideoComponent,
    YourVideoComponent,
    LoaderComponent
  ],
  templateUrl: './access-page.component.html',
  styleUrls: ['./access-page.component.scss']
})
export class AccessPageComponent implements OnInit {
  isMobile = false;
  isModalVisible = true;
  device = Device.DESKTOP;
  isLoaderVisible = false;
  icons = {
    people: faUsers,
    explore: faSearch,
    calls: faPhone,
    chatbots: faBrain,
  }
  constructor(private router: Router, private storeService: StoreService, private socketService: SocketService) { }

  ngOnInit(): void {
    this.checkScreenWidth();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkScreenWidth();
    });

    setTimeout(() => {
      this.isLoaderVisible = false;
    }, 2000);
    const loggedUser = this.storeService.getLoggedUser();
    if (loggedUser)
      this.socketService.connect(loggedUser?._id);
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

  isAccessVisible() {
    const segments = this.router.url.split('/');
    return segments.length === 2 && segments[1] === 'access';
  }

  openModal() {
    this.isModalVisible = true;
  }

  closeModal() {
    this.isModalVisible = false;
  }
}