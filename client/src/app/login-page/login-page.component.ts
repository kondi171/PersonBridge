import { Component, NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faFingerprint, faMicrophone, faKey } from '@fortawesome/free-solid-svg-icons';
import { BackgroundEffectComponent } from '../side-components/background-effect/background-effect.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../services/store.service';
import { environment } from '../app.environment';
import { SocketService } from '../services/socket.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    FontAwesomeModule,
    BackgroundEffectComponent,
  ],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {
  loginData = {
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
    private socketService: SocketService,
    private toastr: ToastrService
  ) {
  }

  switchToRegisterPage() {
    this.router.navigate(['/register']);
  }

  showSuccess() {

  }

  onSubmit() {
    fetch(`${environment.apiUrl}/authentication/login`, {
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
        if (data.message === "No user found!") {
          this.toastr.error(data.message, 'Login Error');
          return;
        } else {
          this.storeService.setLoggedUser(data);
          this.socketService.emitLogin(data._id)
          this.router.navigate(['/access']);
          this.toastr.success('You have successfully logged in!', 'Login Successful');
        }
      })
      .catch(error => {
        this.toastr.error('An Error Occured while logging in!', 'Login Error');
        console.error('Login Error:', error);
      });
  }
}