import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-analytics">
      <div class="page-header">
        <h1>Analytics</h1>
        <p class="subtitle">Detailed analytics and reporting (Coming Soon)</p>
      </div>

      <div class="placeholder-content">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 20V10M12 20V4M6 20v-6" stroke="#5A8DEE" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <h3>Analytics Dashboard</h3>
        <p>Detailed analytics, charts, and reports will be available here.</p>
        <ul class="feature-list">
          <li>Revenue analytics</li>
          <li>Course performance metrics</li>
          <li>User engagement statistics</li>
          <li>Enrollment trends</li>
          <li>Custom reports</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .admin-analytics { max-width: 1400px; }
    .page-header h1 { font-size: 28px; font-weight: 700; color: #1F2937; margin: 0 0 8px 0; }
    .subtitle { font-size: 15px; color: #6B7280; margin: 0 0 32px 0; }
    .placeholder-content { background: white; border-radius: 16px; padding: 60px 40px; text-align: center; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
    .placeholder-content h3 { font-size: 24px; font-weight: 600; color: #1F2937; margin: 20px 0 12px 0; }
    .placeholder-content p { font-size: 16px; color: #6B7280; margin: 0 0 24px 0; }
    .feature-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; max-width: 300px; margin: 0 auto; }
    .feature-list li { padding: 10px 16px; background: #F9FAFB; border-radius: 8px; color: #374151; font-size: 14px; text-align: left; }
  `]
})
export class AdminAnalyticsComponent {
}

