import { Routes } from '@angular/router';
import { RegisterPageComponent } from './register-page/register-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { AccessPageComponent } from './access-page/access-page.component';
import { PeopleComponent } from './access-page/people/people.component';
import { ExploreComponent } from './access-page/explore/explore.component';
import { SettingsComponent } from './access-page/settings/settings.component';
import { personbotsComponent } from './access-page/personbots/personbots.component';
import { NotFoundPageComponent } from './not-found-page/not-found-page.component';
import { LoaderComponent } from './features/loader/loader.component';
import { RedirectGuard } from './services/redirect-guard.service';
import { AuthGuard } from './services/auth-guard.service';
import { UserChatComponent } from './access-page/chats/user-chat/user-chat.component';
import { UserSettingsComponent } from './access-page/chats/user-chat/user-settings/user-settings.component';
import { GroupChatComponent } from './access-page/chats/group-chat/group-chat.component';
import { GroupSettingsComponent } from './access-page/chats/group-chat/group-settings/group-settings.component';

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
      {
        path: 'chat',
        children: [
          { path: 'user/:id', component: UserChatComponent },
          { path: 'user/:id/settings', component: UserSettingsComponent },
          { path: 'group/:id', component: GroupChatComponent },
          { path: 'group/:id/settings', component: GroupSettingsComponent }
        ]
      },
      { path: 'people', component: PeopleComponent },
      { path: 'explore', component: ExploreComponent },
      { path: 'personbots', component: personbotsComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  },
  { path: '**', component: NotFoundPageComponent },
];
