import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent {
  authService = inject(AuthService);
  router = inject(Router);
  http = inject(HttpClient);

  showPassword = false;
  email = '';
  password = '';
  errorMessage = '';

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onLogin(event?: Event) {
    if (event) event.preventDefault();
    this.errorMessage = '';
    
    this.http.post<{data: {token: string, user: {role: string}}}>(`${environment.apiUrl}/auth/login`, {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res) => {
        if (res.data.user.role !== 'Admin') {
          this.errorMessage = 'Invalid credentials';
          return;
        }
        
        this.authService.login(res.data.token);
        
        // Admin logins should redirect to /admin instead of /board
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Login failed';
      }
    });
  }
}
