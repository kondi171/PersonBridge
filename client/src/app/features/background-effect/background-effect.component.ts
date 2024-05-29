import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-background-effect',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './background-effect.component.html',
  styleUrl: './background-effect.component.scss'
})
export class BackgroundEffectComponent {
  elements = Array(10).fill(0);
}
