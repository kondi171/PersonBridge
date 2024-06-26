import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faFingerprint, faMicrophone, faKey } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../services/store.service';
import { ToastrService } from 'ngx-toastr';
import { LoginData } from '../typescript/types';
import { environment } from '../app.environment';
import { BackgroundEffectComponent } from '../features/background-effect/background-effect.component';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AudioService } from '../services/audio.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    FontAwesomeModule,
    BackgroundEffectComponent
  ],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  animations: [
    trigger('slideInLeft', [
      state('void', style({ transform: 'translateX(-100%)', opacity: 0 })),
      state('*', style({ transform: 'translateX(0)', opacity: 1 })),
      transition(':enter', [
        animate('600ms ease-out')
      ]),
      transition(':leave', [
        animate('600ms ease-in', style({ transform: 'translateX(-100%)', opacity: 0 }))
      ])
    ]),
    trigger('slideDown', [
      state('void', style({ transform: 'translateY(-100%)', opacity: 0 })),
      state('*', style({ transform: 'translateY(0)', opacity: 1 })),
      transition(':enter', [
        animate('600ms ease-out')
      ]),
      transition(':leave', [
        animate('600ms ease-in', style({ transform: 'translateY(-100%)', opacity: 0 }))
      ])
    ]),
    trigger('slideUp', [
      state('void', style({ transform: 'translateY(100%)', opacity: 0 })),
      state('*', style({ transform: 'translateY(0)', opacity: 1 })),
      transition(':enter', [
        animate('600ms ease-out')
      ]),
      transition(':leave', [
        animate('600ms ease-in', style({ transform: 'translateY(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class LoginPageComponent {
  loginData: LoginData = {
    mail: '',
    password: ''
  };
  icons = {
    password: faKey,
    biometric: faFingerprint,
    voice: faMicrophone,
    mail: faEnvelope
  };

  constructor(
    private router: Router,
    private storeService: StoreService,
    private toastr: ToastrService,
    private audioService: AudioService
  ) { }

  switchToRegisterPage() {
    this.router.navigate(['/register']);
  }

  onSubmit() {
    fetch(`${environment.apiURL}/authentication/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(this.loginData)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Login failed');
        }
        return response.json();
      })
      .then(data => {
        if (data.message) {
          this.toastr.error(data.message, 'Login Error');
          this.audioService.playErrorSound();
          return;
        } else {
          this.storeService.setLoggedUser(data);
          this.router.navigate(['/access']);
          this.toastr.success('You have successfully logged in!', 'Login Successful');
          this.audioService.playSuccessSound();
        }
      })
      .catch(error => {
        this.toastr.error('An Error Occured while logging in!', 'Login Error');
        this.audioService.playErrorSound();
        console.error('Login Error:', error);
      });
  }
}
