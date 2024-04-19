import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faCog, faComments, faEnvelope, faFaceLaugh, faFingerprint, faKey, faMicrophone, faRightFromBracket, faTrashCan, faUser, faUserGroup, faUserMinus } from '@fortawesome/free-solid-svg-icons';
import { FooterComponent } from '../../side-components/footer/footer.component';

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
}
// icons = {
//   messages: faComments,
//   mute: faBellSlash,
//   ignore: faCommentSlash,
//   block: faLock,
//   pin: faKey,
//   nickname: faA,
//   remove: faUserMinus,
// }
