import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faFingerprint, faMicrophone, faKey } from '@fortawesome/free-solid-svg-icons';
import { BackgroundEffectComponent } from '../side-components/background-effect/background-effect.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FontAwesomeModule, BackgroundEffectComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {
  constructor(private router: Router) { }
  icons = {
    password: faKey,
    biometric: faFingerprint,
    voice: faMicrophone,
    mail: faEnvelope
  }
  switchToRegisterPage() {
    this.router.navigate(['/register']);
  }
}
