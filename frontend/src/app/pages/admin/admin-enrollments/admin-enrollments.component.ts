import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface AdminEnrollment {
  id: number;
  userName: string;
  userEmail: string;
  courseTitle: string;
  enrolledAt: string;
  progress: number;
}

@Component({
  selector: 'app-admin-enrollments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-enrollments">
      <div class="page-header">
        <div>
          <h1>Enrollment Management</h1>
          <p class="subtitle">View all course enrollments and student progress</p>
        </div>
      </div>

      <div class="filters-bar">
        <div class="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
            <path d="M16 16L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input type="text" placeholder="Search enrollments..." [(ngModel)]="searchTerm" (keyup.enter)="loadEnrollments()">
        </div>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading enrollments...</p>
      </div>

      <div *ngIf="!loading && enrollments.length > 0" class="enrollments-table">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Course</th>
              <th>Progress</th>
              <th>Enrolled</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let enrollment of enrollments">
              <td>
                <div class="student-info">
                  <strong>{{ enrollment.userName }}</strong>
                  <span class="email">{{ enrollment.userEmail }}</span>
                </div>
              </td>
              <td>{{ enrollment.courseTitle }}</td>
              <td>
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="enrollment.progress"></div>
                </div>
                <span class="progress-text">{{ enrollment.progress }}%</span>
              </td>
              <td>{{ enrollment.enrolledAt | date:'short' }}</td>
              <td>
                <button class="action-btn" (click)="viewProgress(enrollment.id)">View Details</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .admin-enrollments { max-width: 1400px; }
    .page-header h1 { font-size: 28px; font-weight: 700; color: #1F2937; margin: 0 0 8px 0; }
    .subtitle { font-size: 15px; color: #6B7280; margin: 0 0 32px 0; }
    .filters-bar { margin-bottom: 24px; }
    .search-box { position: relative; display: flex; align-items: center; max-width: 400px; }
    .search-box svg { position: absolute; left: 16px; color: #9CA3AF; }
    .search-box input { width: 100%; padding: 12px 16px 12px 44px; border: 1px solid #E5E7EB; border-radius: 10px; font-size: 15px; }
    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px; gap: 16px; }
    .spinner { width: 48px; height: 48px; border: 4px solid #E5E7EB; border-top-color: #5A8DEE; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .enrollments-table { background: white; border-radius: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    thead { background: #F9FAFB; border-bottom: 1px solid #E5E7EB; }
    th { padding: 16px 20px; text-align: left; font-size: 13px; font-weight: 600; color: #6B7280; text-transform: uppercase; }
    tbody tr { border-bottom: 1px solid #E5E7EB; }
    tbody tr:hover { background: #F9FAFB; }
    td { padding: 16px 20px; font-size: 14px; color: #374151; }
    .student-info { display: flex; flex-direction: column; gap: 4px; }
    .email { font-size: 13px; color: #9CA3AF; }
    .progress-bar { width: 150px; height: 8px; background: #E5E7EB; border-radius: 4px; overflow: hidden; margin-bottom: 4px; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #5A8DEE, #4F46E5); transition: width 0.3s; }
    .progress-text { font-size: 13px; font-weight: 600; color: #5A8DEE; }
    .action-btn { padding: 6px 14px; background: white; color: #5A8DEE; border: 1px solid #5A8DEE; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; }
    .action-btn:hover { background: #5A8DEE; color: white; }
  `]
})
export class AdminEnrollmentsComponent implements OnInit {
  private readonly http = inject(HttpClient);

  enrollments: AdminEnrollment[] = [];
  loading = true;
  searchTerm = '';

  ngOnInit(): void {
    this.loadEnrollments();
  }

  loadEnrollments(): void {
    let url = '/api/admin/enrollments';
    if (this.searchTerm) url += `?q=${this.searchTerm}`;

    this.http.get<AdminEnrollment[]>(url).subscribe({
      next: (data) => {
        this.enrollments = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading enrollments:', err);
        this.loading = false;
      }
    });
  }

  viewProgress(id: number): void {
    alert(`View enrollment details (ID: ${id}) - Full implementation pending`);
  }
}

