import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  animations: [
    trigger('fade', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),
      transition('void <=> *', animate('100ms ease-in')),
    ]),
    trigger('fadeWithDelay', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),
      transition('void => *', animate('300ms 100ms ease-in')), // 100ms delay
    ]),
  ],
})
export class LoaderComponent {
  loaderSquares = Array(7).fill(0);
}
