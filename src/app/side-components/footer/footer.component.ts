import { Component, Input } from '@angular/core';
import { Position } from '../../typescript/enums';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  Position = Position;
  @Input() position = Position.STICKY;
}
