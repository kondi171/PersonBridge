import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-your-audio',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './your-audio.component.html',
  styleUrl: './your-audio.component.scss'
})
export class YourAudioComponent {
  icons = {
    cancel: faX
  }
}
