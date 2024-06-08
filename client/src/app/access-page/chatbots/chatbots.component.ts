import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBrain, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FooterComponent } from '../../features/footer/footer.component';
import { ChatType, Position } from '../../typescript/enums';
import { Router, RouterModule } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../app.environment';
import { StoreService } from '../../services/store.service';
import { AudioService } from '../../services/audio.service';
import { Chatbot } from '../../typescript/interfaces';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chatbots',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, RouterModule, FooterComponent],
  templateUrl: './chatbots.component.html',
  styleUrls: ['./chatbots.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-in', style({ opacity: 1 }))
      ])
    ]),
  ]
})
export class ChabotsComponent implements OnInit {
  Position = Position;
  chatType = ChatType.BOT_CHAT;
  loggedUserSubscription: Subscription;
  icons = {
    section: faBrain,
    back: faChevronLeft,
  };
  yourID = "";
  userMessage: string = '';
  botReply: string = '';
  chatbots: Chatbot[] = [];

  constructor(private storeService: StoreService, private audioService: AudioService, private router: Router) {
    this.loggedUserSubscription = this.storeService.loggedUser$.subscribe(user => {
      if (user) {
        this.yourID = user._id;
      }
    });
  }

  ngOnInit(): void {
    fetch(`${environment.apiURL}/chatbots`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => {
        this.chatbots = data.chatbots;
      })
  }

  addChatbot(chatbotID: string) {
    fetch(`${environment.apiURL}/chatbots/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ yourID: this.yourID, chatbotID: chatbotID })
    })
      .then(response => response.json())
      .then(data => {
        // console.log(data.message)
        this.audioService.playChangeStateSound();
        this.storeService.updateChatType(this.chatType);
        this.storeService.updateChatID(chatbotID);
        this.router.navigate(['/access/chat/', this.chatType, chatbotID]);
      })
  }

  showMessages(chatID: string,) {
    this.addChatbot(chatID);
  }
}