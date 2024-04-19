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

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  // { path: '**', component: PageNotFoundComponent }, // Możesz dodać obsługę nieznanych ścieżek
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  {
    path: 'access',
    component: AccessPageComponent,
    children: [
      { path: 'chat', component: ChatComponent },
      { path: 'chat/settings', component: ChatSettingsComponent },
      { path: 'people', component: PeopleComponent },
      { path: 'explore', component: ExploreComponent },
      { path: 'chatbots', component: ChatbotsComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  },
];
