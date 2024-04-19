import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppStoreService } from '../../../services/store/app-store.service';
import { ActiveState } from '../../../typescript/enums';

@Component({
  selector: 'app-message-row',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
