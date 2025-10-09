import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  sidebarOpen = true;

  menuItems = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/admin/dashboard',
      active: true
    },
    {
      label: 'Courses',
      icon: 'book',
      route: '/admin/courses',
      active: false
    },
    {
      label: 'Users',
      icon: 'users',
      route: '/admin/users',
      active: false
    },
    {
      label: 'Orders',
      icon: 'shopping-bag',
      route: '/admin/orders',
      active: false
    },
    {
      label: 'Enrollments',
      icon: 'graduation-cap',
      route: '/admin/enrollments',
      active: false
    },
    {
      label: 'Analytics',
      icon: 'chart',
      route: '/admin/analytics',
      active: false
    }
  ];

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  backToSite(): void {
    this.router.navigate(['/']);
  }
}

