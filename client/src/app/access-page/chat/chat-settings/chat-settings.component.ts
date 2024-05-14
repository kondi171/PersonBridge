import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBellSlash, faCommentSlash, faLock, faKey, faA, faComments, faUserMinus, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FooterComponent } from '../../../features/footer/footer.component';
import { RouterModule } from '@angular/router';
import { Position } from '../../../typescript/enums';
@Component({
  selector: 'app-chat-settings',
  standalone: true,
  imports: [FontAwesomeModule, FooterComponent, RouterModule],
  templateUrl: './chat-settings.component.html',
  styleUrl: './chat-settings.component.scss'
})
export class ChatSettingsComponent {
  Position = Position;

  icons = {
    messages: faComments,
    mute: faBellSlash,
    ignore: faCommentSlash,
    block: faLock,
    pin: faKey,
    nickname: faA,
    remove: faUserMinus,
    back: faChevronLeft,
  }
}
