import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';

export interface UserContext {
  id: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private router = inject(Router);
  
  public isLoggedIn = signal<boolean>(false);
  public currentUser = signal<UserContext | null>(null);

  constructor() {
    this.checkToken();
  }

  isAdmin(): boolean {
    const user = this.currentUser();
    return !!(user && user.role === 'Admin');
  }

  private checkToken() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload)) as UserContext;
        this.currentUser.set(decoded);
        this.isLoggedIn.set(true);
      } catch (e) {
        this.logout();
      }
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  login(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.checkToken();
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
