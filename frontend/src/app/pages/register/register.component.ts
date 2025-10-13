import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <h1>Create Account</h1>
            <p>Join Codeless and start learning today</p>
          </div>

          <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
            <div class="form-group">
              <label for="fullName">Full Name</label>
              <input 
                type="text" 
                id="fullName" 
                name="fullName"
                [(ngModel)]="formData.fullName" 
                required
                minlength="2"
                placeholder="John Doe"
                [disabled]="isLoading">
            </div>

            <div class="form-group">
              <label for="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                [(ngModel)]="formData.email" 
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
                [(ngModel)]="formData.password" 
                required
                minlength="6"
                placeholder="••••••••"
                [disabled]="isLoading">
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirm Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword"
                [(ngModel)]="confirmPassword" 
                required
                minlength="6"
                placeholder="••••••••"
                [disabled]="isLoading">
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" name="terms" [(ngModel)]="acceptedTerms" (ngModelChange)="clearTermsError()">
                <span>I agree to the <a href="#" class="link-primary">Terms of Service</a> and <a href="#" class="link-primary">Privacy Policy</a></span>
              </label>
            </div>

            @if (errorMessage) {
              <div class="error-message">
                {{ errorMessage }}
              </div>
            }

            <button 
              type="submit" 
              class="btn-primary btn-full"
              [disabled]="!registerForm.form.valid || isLoading">
              {{ isLoading ? 'Creating Account...' : 'Sign Up' }}
            </button>
          </form>

          <div class="auth-footer">
            <p>Already have an account? <a routerLink="/login" class="link-primary">Log in</a></p>
          </div>
        </div>

        <div class="auth-visual">
          <div class="visual-content">
            <h2>Why Choose Codeless?</h2>
            <p>Everything you need to excel in IT Project Management.</p>
            <ul class="benefits-list">
              <li>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Comprehensive curriculum</span>
              </li>
              <li>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Real-world projects</span>
              </li>
              <li>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Community support</span>
              </li>
              <li>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Career advancement</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent {
  formData = {
    fullName: '',
    email: '',
    password: ''
  };
  
  confirmPassword = '';
  acceptedTerms = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  clearTermsError(): void {
    // Clear error message when user checks the terms checkbox
    if (this.acceptedTerms && this.errorMessage.includes('Terms of Service')) {
      this.errorMessage = '';
    }
  }

  onSubmit(): void {
    // Validate Terms & Service checkbox
    if (!this.acceptedTerms) {
      this.errorMessage = 'You must agree to the Terms of Service and Privacy Policy to create an account.';
      return;
    }

    if (this.formData.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.formData).subscribe({
      next: () => {
        this.router.navigate(['/courses']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}

