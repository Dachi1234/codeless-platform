import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';
  showMobileNav = false;

  constructor(
    public authService: AuthService,
    public cartService: CartService,
    private router: Router
  ) {}

  toggleMobileNav(): void {
    this.showMobileNav = !this.showMobileNav;
  }

  closeMobileNav(): void {
    this.showMobileNav = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  /**
   * Navigate to home and scroll to top if already on home page
   */
  goToHome(): void {
    const isOnHome = this.router.url === '/home' || this.router.url === '/';
    
    if (isOnHome) {
      // Already on home page - just scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Navigate to home
      this.router.navigate(['/home']).then(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }
}
