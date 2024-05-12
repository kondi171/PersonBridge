import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faCog, faComments, faEnvelope, faFaceLaugh, faFingerprint, faKey, faMicrophone, faRightFromBracket, faTrashCan, faUser, faUserGroup, faUserMinus } from '@fortawesome/free-solid-svg-icons';
import { FooterComponent } from '../../side-components/footer/footer.component';
import { StoreService } from '../../services/store.service';
import { SocketService } from '../../services/socket.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FontAwesomeModule, RouterModule, FooterComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  icons = {
    section: faCog,
    back: faChevronLeft,
    logout: faRightFromBracket,
    messages: faComments,
    remove: faTrashCan,
    edit: {
      name: faUser,
      lastname: faUserGroup,
      mail: faEnvelope,
      password: faKey
    },
    biometric: {
      fingerprint: faFingerprint,
      face: faFaceLaugh,
      voice: faMicrophone
    }
  }

  constructor(
    private storeService: StoreService,
    private socketService: SocketService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  logout() {
    this.storeService.removeLoggedUser();
    this.socketService.disconnect();
    this.router.navigate(['/login']);
    this.toastr.success('You have successfully logged out!', 'Logout Successful');

  }
}
