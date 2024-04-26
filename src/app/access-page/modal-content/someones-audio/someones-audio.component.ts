import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPhone, faPhoneSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-someones-audio',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './someones-audio.component.html',
  styleUrl: './someones-audio.component.scss'
})
export class SomeonesAudioComponent {
  icons = {
    accept: faPhone,
    decline: faPhoneSlash
  }
}
