import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-your-video',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './your-video.component.html',
  styleUrl: './your-video.component.scss'
})
export class YourVideoComponent {
  icons = {
    cancel: faX
  }
}
