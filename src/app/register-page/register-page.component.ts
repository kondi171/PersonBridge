import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BackgroundEffectComponent } from '../side-components/background-effect/background-effect.component';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [BackgroundEffectComponent],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss'
})
export class RegisterPageComponent {
  constructor(private router: Router) { }

  switchToLoginPage() {
    this.router.navigate(['/login']);
  }

}
