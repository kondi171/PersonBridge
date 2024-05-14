import { Routes } from '@angular/router';
import { RegisterPageComponent } from './register-page/register-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { AccessPageComponent } from './access-page/access-page.component';
import { ChatComponent } from './access-page/chat/chat.component';
import { PeopleComponent } from './access-page/people/people.component';
import { ExploreComponent } from './access-page/explore/explore.component';
import { SettingsComponent } from './access-page/settings/settings.component';
import { ChatSettingsComponent } from './access-page/chat/chat-settings/chat-settings.component';
import { ChatbotsComponent } from './access-page/chatbots/chatbots.component';
import { NotFoundPageComponent } from './not-found-page/not-found-page.component';
import { LoaderComponent } from './features/loader/loader.component';
import { RedirectGuard } from './services/redirect-guard.service';
import { AuthGuard } from './services/auth-guard.service';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent, canActivate: [RedirectGuard] },
  { path: 'register', component: RegisterPageComponent, canActivate: [RedirectGuard] },
  { path: 'loader', component: LoaderComponent },
  {
    path: 'access',
    component: AccessPageComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'chat/:id', component: ChatComponent },
      { path: 'chat/:id/settings', component: ChatSettingsComponent },
      { path: 'people', component: PeopleComponent },
      { path: 'explore', component: ExploreComponent },
      { path: 'chatbots', component: ChatbotsComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  },
  { path: '**', component: NotFoundPageComponent },
];
