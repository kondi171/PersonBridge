import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BackgroundEffectComponent } from '../features/background-effect/background-effect.component';
import { FormsModule } from '@angular/forms';
import { RegisterData } from '../typescript/types';
import { environment } from '../app.environment';
import { ToastrService } from 'ngx-toastr';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AudioService } from '../services/audio.service';
@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [FormsModule, BackgroundEffectComponent],
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss'],
  animations: [
    trigger('slideInRight', [
      state('void', style({ transform: 'translateX(100%)', opacity: 0 })),
      state('*', style({ transform: 'translateX(0)', opacity: 1 })),
      transition(':enter', [
        animate('800ms ease-out')
      ]),
      transition(':leave', [
        animate('800ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
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
        animate('800ms ease-out')
      ]),
      transition(':leave', [
        animate('800ms ease-in', style({ transform: 'translateY(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class RegisterPageComponent {
  registerData: RegisterData = {
    mail: '',
    name: '',
    lastname: '',
    password: ''
  }

  constructor(private router: Router, private toastr: ToastrService, private audioService: AudioService) { }

  switchToLoginPage() {
    this.router.navigate(['/login']);
  }

  registerUser() {
    fetch(`${environment.apiURL}/authentication/register`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.registerData)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Internal Server Error');
        }
        return response.json();
      })
      .catch(error => {
        console.error('Internal Server Error:', error);
        throw error;
      });
  }

  validateForm() {
    let valid = true;
    if (!this.registerData.mail || !/\S+@\S+\.\S+/.test(this.registerData.mail)) {
      this.toastr.error('Invalid email address!', 'Register Error');
      this.audioService.playErrorSound();
      valid = false;
    }
    if (!this.registerData.name.trim()) {
      this.toastr.error('Name is required!', 'Register Error');
      this.audioService.playErrorSound();
      valid = false;
    }
    if (!this.registerData.lastname.trim()) {
      this.toastr.error('Lastname is required!', 'Register Error');
      this.audioService.playErrorSound();
      valid = false;
    }
    if (!this.registerData.password || this.registerData.password.length < 6) {
      this.toastr.error('Password must be at least 6 characters long!', 'Register Error');
      this.audioService.playErrorSound();
      valid = false;
    }
    if (valid) {
      this.toastr.success('Registration successful!', 'Register Successful');
      this.audioService.playSuccessSound();
      this.registerUser();
      this.registerData = {
        mail: '',
        name: '',
        lastname: '',
        password: ''
      }
    }
  }
}
