import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message-row',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-row.component.html',
  styleUrl: './message-row.component.scss'
})
export class MessageRowComponent {
  @Input() person: string = "";
  @Input() avatarSrc: string = "";
  @Input() status: boolean = true;
  @Input() lastMessage: string = "";
  @Input() read: boolean = false;
}
