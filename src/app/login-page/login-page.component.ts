import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faFingerprint, faMicrophone, faKey, faE } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FontAwesomeModule],
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
