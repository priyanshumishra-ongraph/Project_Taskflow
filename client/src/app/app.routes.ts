import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { BoardComponent } from './components/board/board.component';
import { TaskDetailComponent } from './components/task-detail/task-detail.component';
import { ProfileComponent } from './components/profile/profile.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { guestGuard } from './guards/guest.guard';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';

import { AdminLoginComponent } from './components/admin-login/admin-login.component';

export const routes: Routes = [
  { path: '', redirectTo: '/board', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [guestGuard] },
  { path: 'admin-login', component: AdminLoginComponent, canActivate: [guestGuard] },
  { path: 'board', component: BoardComponent, canActivate: [authGuard] },
  { path: 'task/:id', component: TaskDetailComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [authGuard, adminGuard] },
  { path: '**', component: NotFoundComponent }
];
