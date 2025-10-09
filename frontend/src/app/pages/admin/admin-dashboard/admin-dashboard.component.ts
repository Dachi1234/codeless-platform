import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface DashboardStats {
  totalRevenue: number;
  totalEnrollments: number;
  activeCourses: number;
  totalUsers: number;
  revenueChange: number;
  enrollmentChange: number;
  courseChange: number;
  userChange: number;
}

interface RecentOrder {
  id: number;
  userName: string;
  userEmail: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface RecentEnrollment {
  id: number;
  userName: string;
  courseTitle: string;
  enrolledAt: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  private readonly http = inject(HttpClient);

  stats: DashboardStats = {
    totalRevenue: 0,
    totalEnrollments: 0,
    activeCourses: 0,
    totalUsers: 0,
    revenueChange: 0,
    enrollmentChange: 0,
    courseChange: 0,
    userChange: 0
  };

  recentOrders: RecentOrder[] = [];
  recentEnrollments: RecentEnrollment[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.http.get<DashboardStats>('/api/admin/dashboard/stats').subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard stats:', err);
        this.loading = false;
      }
    });

    this.http.get<RecentOrder[]>('/api/admin/dashboard/recent-orders').subscribe({
      next: (data) => {
        this.recentOrders = data;
      },
      error: (err) => {
        console.error('Error loading recent orders:', err);
      }
    });

    this.http.get<RecentEnrollment[]>('/api/admin/dashboard/recent-enrollments').subscribe({
      next: (data) => {
        this.recentEnrollments = data;
      },
      error: (err) => {
        console.error('Error loading recent enrollments:', err);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'PAID':
      case 'COMPLETED':
        return 'status-success';
      case 'PENDING':
        return 'status-warning';
      case 'FAILED':
      case 'REFUNDED':
        return 'status-error';
      default:
        return 'status-default';
    }
  }
}

