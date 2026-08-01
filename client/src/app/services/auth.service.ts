import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private router = inject(Router);
  
  public isLoggedIn = signal<boolean>(!!localStorage.getItem(this.TOKEN_KEY));

  login(token: string = 'sample_jwt_token_123'): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.isLoggedIn.set(true);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }
}
