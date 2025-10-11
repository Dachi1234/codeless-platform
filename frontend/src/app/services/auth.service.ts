import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface User {
  email: string;
  fullName?: string;
  roles?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  token: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly baseUrl = '/api/auth';
  
  // Reactive signal for current user
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);
  private bootstrapped = false;

  constructor(private http: HttpClient) {
    // Don't auto-initialize; let APP_INITIALIZER handle it
  }

  bootstrap(): Promise<void> {
    if (this.bootstrapped) return Promise.resolve();
    this.bootstrapped = true;

    const token = this.getToken();
    if (!token) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.me().subscribe({
        next: (user) => {
          this.currentUser.set(user);
          this.isAuthenticated.set(true);
          resolve();
        },
        error: () => {
          this.clearToken();
          this.currentUser.set(null);
          this.isAuthenticated.set(false);
          resolve();
        }
      });
    });
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, request)
      .pipe(
        tap(response => {
          this.handleAuthSuccess(response);
          // Fetch full user info including roles
          this.me().subscribe({
            next: (user) => {
              this.currentUser.set(user);
            }
          });
        })
      );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    console.log('🔐 LOGIN: Attempting login for:', request.email);
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request)
      .pipe(
        tap({
          next: (response) => {
            console.log('✅ LOGIN: Received response:', response);
            this.handleAuthSuccess(response);
            // Fetch full user info including roles
            console.log('📡 LOGIN: Fetching user details from /api/me...');
            this.me().subscribe({
              next: (user) => {
                console.log('✅ LOGIN: User details loaded:', user);
                this.currentUser.set(user);
              },
              error: (err) => {
                console.error('❌ LOGIN: Error fetching user info:', err);
                // Set basic user info from login response
                this.currentUser.set({
                  email: response.email,
                  roles: ['ROLE_USER']
                });
              }
            });
          },
          error: (err) => {
            console.error('❌ LOGIN: Login request failed:', err);
          }
        })
      );
  }

  me(): Observable<User> {
    return this.http.get<User>('/api/me');
  }

  logout(): void {
    this.clearToken();
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    this.currentUser.set({ email: response.email });
    this.isAuthenticated.set(true);
  }

  private clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getUserRoles(): string[] {
    return this.currentUser()?.roles || [];
  }

  isAdmin(): boolean {
    return this.getUserRoles().includes('ROLE_ADMIN');
  }

  updateCurrentUser(user: any): void {
    this.currentUser.set(user);
  }
}

