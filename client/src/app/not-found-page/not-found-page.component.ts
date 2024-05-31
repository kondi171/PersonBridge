import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './not-found-page.component.html',
  styleUrls: ['./not-found-page.component.scss'],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0 })),
      transition(':enter', [
        animate('600ms ease-in', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class NotFoundPageComponent {

}
