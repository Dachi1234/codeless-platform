import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <h1>Welcome Back</h1>
            <p>Log in to continue your learning journey</p>
          </div>

          <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
            <div class="form-group">
              <label for="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                [(ngModel)]="credentials.email" 
                required 
                email
                placeholder="you@example.com"
                [disabled]="isLoading">
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password"
                [(ngModel)]="credentials.password" 
                required
                minlength="6"
                placeholder="••••••••"
                [disabled]="isLoading">
            </div>

            <div class="form-footer">
              <label class="checkbox-label">
                <input type="checkbox" name="remember">
                <span>Remember me</span>
              </label>
              <a href="#" class="forgot-link">Forgot password?</a>
            </div>

            @if (errorMessage) {
              <div class="error-message">
                {{ errorMessage }}
              </div>
            }

            <button 
              type="submit" 
              class="btn-primary btn-full"
              [disabled]="!loginForm.form.valid || isLoading">
              {{ isLoading ? 'Logging in...' : 'Log In' }}
            </button>
          </form>

          <div class="auth-footer">
            <p>Don't have an account? <a routerLink="/register" class="link-primary">Sign up</a></p>
          </div>
        </div>

        <div class="auth-visual">
          <div class="visual-content">
            <h2>Start Your IT Project Management Journey</h2>
            <p>Join thousands of learners mastering IT Project Management with Codeless.</p>
            <ul class="benefits-list">
              <li>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Expert-led courses</span>
              </li>
              <li>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Industry certifications</span>
              </li>
              <li>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Lifetime access</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };
  
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    console.log('Login form submitted with:', this.credentials);
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.isLoading = false;
        this.router.navigate(['/courses']);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
      },
      complete: () => {
        console.log('Login request completed');
      }
    });
  }
}

