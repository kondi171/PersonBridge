import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-message-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-box.component.html',
  styleUrl: './message-box.component.scss'
})
export class MessageBoxComponent {
  @Input() name: string = "";
  @Input() avatarSrc: string = "";
  @Input() message: string = "";
  @Input() isYou: boolean = false;
}
