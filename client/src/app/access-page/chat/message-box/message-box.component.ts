import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../../../typescript/types';
import { StoreService } from '../../../services/store.service';
@Component({
  selector: 'app-message-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-box.component.html',
  styleUrl: './message-box.component.scss'
})
export class MessageBoxComponent {
  @Input() name: string = "";
  @Input() avatar: string = "";
  @Input() message: Message = {
    content: '',
    date: '',
    sender: ''
  };

  yourName: string = "";
  yourAvatar: string = "";
  constructor(private storeService: StoreService) {
    const loggedUser = storeService.getLoggedUser();
    if (loggedUser !== null) {
      this.yourName = loggedUser.name;
      this.yourAvatar = loggedUser.avatar;
    }
    // console.log(this.message)
  }

}
