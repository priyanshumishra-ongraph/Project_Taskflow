import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { BoardComponent } from './components/board/board.component';
import { TaskDetailComponent } from './components/task-detail/task-detail.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: '/board', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'board', component: BoardComponent },
  { path: 'task/:id', component: TaskDetailComponent },
  { path: '**', component: NotFoundComponent }
];
