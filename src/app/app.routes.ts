import { Routes } from '@angular/router';
import { RegisterPageComponent } from './register-page/register-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { AccessPageComponent } from './access-page/access-page.component';
import { ChatComponent } from './access-page/chat/chat.component';

export const routes: Routes = [
  { path: 'register', component: RegisterPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'access', component: AccessPageComponent },
  { path: 'access/chat', component: ChatComponent },

];
