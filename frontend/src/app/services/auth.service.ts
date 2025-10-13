import { Injectable, signal, inject } from '@angular/core';
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
  rememberMe?: boolean;
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
  private readonly http = inject(HttpClient);
  private readonly TOKEN_KEY = 'auth_token';
  private readonly baseUrl = '/api/auth';
  
  // Reactive signal for current user
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);
  private bootstrapped = false;
  
  // Track whether user chose "Remember Me"
  private useLocalStorage = false;
  
  // Callback for when auth state changes (used by CartService)
  private authChangeCallbacks: Array<(authenticated: boolean) => void> = [];

  constructor() {
    // Don't auto-initialize; let APP_INITIALIZER handle it
  }
  
  /**
   * Register a callback to be called when authentication state changes
   */
  onAuthChange(callback: (authenticated: boolean) => void): void {
    this.authChangeCallbacks.push(callback);
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

  login(request: LoginRequest, rememberMe: boolean = false): Observable<AuthResponse> {
    console.log('🔐 LOGIN: Attempting login for:', request.email, 'Remember me:', rememberMe);
    
    // Include rememberMe in the request
    const loginPayload = { ...request, rememberMe };
    
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, loginPayload)
      .pipe(
        tap({
          next: (response) => {
            console.log('✅ LOGIN: Received response:', response);
            this.handleAuthSuccess(response, rememberMe);
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
    // Check localStorage first (rememberMe), then sessionStorage
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  private handleAuthSuccess(response: AuthResponse, rememberMe: boolean = false): void {
    this.useLocalStorage = rememberMe;
    
    if (rememberMe) {
      // Store in localStorage for persistent login (14 days)
      localStorage.setItem(this.TOKEN_KEY, response.token);
      sessionStorage.removeItem(this.TOKEN_KEY); // Clear from session if exists
      console.log('💾 Token stored in localStorage (Remember Me: ON, 14 days)');
    } else {
      // Store in sessionStorage for temporary login (4 hours, cleared on browser close)
      sessionStorage.setItem(this.TOKEN_KEY, response.token);
      localStorage.removeItem(this.TOKEN_KEY); // Clear from local if exists
      console.log('💾 Token stored in sessionStorage (Remember Me: OFF, 4 hours)');
    }
    
    this.currentUser.set({ email: response.email });
    this.isAuthenticated.set(true);
    this.notifyAuthChange(true);
  }

  private clearToken(): void {
    // Clear from both storage types
    localStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    this.notifyAuthChange(false);
  }
  
  private notifyAuthChange(authenticated: boolean): void {
    this.authChangeCallbacks.forEach(callback => callback(authenticated));
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

