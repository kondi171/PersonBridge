import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faVideo, faVideoSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-someones-video',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './someones-video.component.html',
  styleUrl: './someones-video.component.scss'
})
export class SomeonesVideoComponent {
  icons = {
    accept: faVideo,
    decline: faVideoSlash
  }
}
