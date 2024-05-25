import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatType } from '../../typescript/enums';
import { UserChatComponent } from './user-chat/user-chat.component';
import { GroupChatComponent } from './group-chat/group-chat.component';
import { Subscription } from 'rxjs';
import { StoreService } from '../../services/store.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, UserChatComponent, GroupChatComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  ChatType = ChatType;
  activeChatType = ChatType.USER_CHAT;
  chatTypeSubscription: Subscription;

  constructor(private storeService: StoreService) {
    this.chatTypeSubscription = this.storeService.chatType$.subscribe(chatType => {
      this.activeChatType = chatType;
    });
  }
}