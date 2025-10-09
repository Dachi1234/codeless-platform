import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  roles: string[];
  createdAt: string;
  enabled: boolean;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-users">
      <div class="page-header">
        <div>
          <h1>User Management</h1>
          <p class="subtitle">Manage users, roles, and permissions</p>
        </div>
      </div>

      <div class="filters-bar">
        <div class="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
            <path d="M16 16L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input type="text" placeholder="Search users..." [(ngModel)]="searchTerm" (keyup.enter)="loadUsers()">
        </div>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading users...</p>
      </div>

      <div *ngIf="!loading && users.length > 0" class="users-table">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Roles</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>{{ user.fullName }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span *ngFor="let role of user.roles" class="role-badge">{{ role }}</span>
              </td>
              <td>
                <span class="status" [class.active]="user.enabled" [class.suspended]="!user.enabled">
                  {{ user.enabled ? 'Active' : 'Suspended' }}
                </span>
              </td>
              <td>{{ user.createdAt | date:'short' }}</td>
              <td>
                <div class="actions">
                  <button class="action-btn" (click)="toggleUserStatus(user)" [title]="user.enabled ? 'Suspend' : 'Activate'">
                    {{ user.enabled ? 'Suspend' : 'Activate' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .admin-users { max-width: 1400px; }
    .page-header h1 { font-size: 28px; font-weight: 700; color: #1F2937; margin: 0 0 8px 0; }
    .subtitle { font-size: 15px; color: #6B7280; margin: 0 0 32px 0; }
    .filters-bar { margin-bottom: 24px; }
    .search-box { position: relative; display: flex; align-items: center; max-width: 400px; }
    .search-box svg { position: absolute; left: 16px; color: #9CA3AF; }
    .search-box input { width: 100%; padding: 12px 16px 12px 44px; border: 1px solid #E5E7EB; border-radius: 10px; font-size: 15px; }
    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px; gap: 16px; }
    .spinner { width: 48px; height: 48px; border: 4px solid #E5E7EB; border-top-color: #5A8DEE; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .users-table { background: white; border-radius: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    thead { background: #F9FAFB; border-bottom: 1px solid #E5E7EB; }
    th { padding: 16px 20px; text-align: left; font-size: 13px; font-weight: 600; color: #6B7280; text-transform: uppercase; }
    tbody tr { border-bottom: 1px solid #E5E7EB; }
    tbody tr:hover { background: #F9FAFB; }
    td { padding: 16px 20px; font-size: 14px; color: #374151; }
    .role-badge { display: inline-block; padding: 4px 10px; background: #E0E7FF; color: #3730A3; border-radius: 12px; font-size: 11px; font-weight: 600; margin-right: 4px; }
    .status { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .status.active { background: #D1FAE5; color: #065F46; }
    .status.suspended { background: #FEE2E2; color: #991B1B; }
    .actions { display: flex; gap: 8px; }
    .action-btn { padding: 6px 14px; background: white; color: #5A8DEE; border: 1px solid #5A8DEE; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; }
    .action-btn:hover { background: #5A8DEE; color: white; }
  `]
})
export class AdminUsersComponent implements OnInit {
  private readonly http = inject(HttpClient);

  users: AdminUser[] = [];
  loading = true;
  searchTerm = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    let url = '/api/admin/users';
    if (this.searchTerm) url += `?q=${this.searchTerm}`;

    this.http.get<AdminUser[]>(url).subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.loading = false;
      }
    });
  }

  toggleUserStatus(user: AdminUser): void {
    this.http.patch(`/api/admin/users/${user.id}/toggle-status`, {}).subscribe({
      next: () => {
        user.enabled = !user.enabled;
      },
      error: (err) => {
        console.error('Error toggling user status:', err);
        alert('Failed to update user status');
      }
    });
  }
}

