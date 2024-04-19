import { Component, Input } from '@angular/core';
import { CardType } from '../../../typescript/enums';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {
  CardType = CardType;

  @Input() name: string = "";
  @Input() avatarSrc: string = "";
  @Input() mail: string = "";
  @Input() type: CardType = CardType.ONLINE;
}
