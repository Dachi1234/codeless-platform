import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService, DashboardStats, Achievement, CourseProgress } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  achievements: Achievement[] = [];
  coursesWithProgress: CourseProgress[] = [];
  loading = true;
  activeTab: 'in-progress' | 'completed' | 'all' = 'in-progress';

  constructor(
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    
    // Load stats
    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });

    // Load achievements
    this.dashboardService.getAchievements().subscribe({
      next: (achievements) => {
        this.achievements = achievements;
      }
    });

    // Load enrolled courses WITH progress
    this.dashboardService.getCoursesWithProgress().subscribe({
      next: (courses) => {
        console.log('[Dashboard] Loaded courses with progress:', courses);
        this.coursesWithProgress = courses;
        console.log('[Dashboard] Active tab:', this.activeTab);
        console.log('[Dashboard] Filtered courses:', this.getFilteredCourses());
      },
      error: (err) => {
        console.error('[Dashboard] Error loading courses with progress:', err);
        console.error('[Dashboard] Error details:', err.error);
      }
    });
  }

  setActiveTab(tab: 'in-progress' | 'completed' | 'all'): void {
    this.activeTab = tab;
  }

  getFilteredCourses(): CourseProgress[] {
    if (this.activeTab === 'completed') {
      return this.coursesWithProgress.filter(c => c.completionPercentage === 100);
    } else if (this.activeTab === 'in-progress') {
      // Show courses that are NOT completed (including 0% - newly enrolled)
      return this.coursesWithProgress.filter(c => c.completionPercentage < 100);
    } else {
      return this.coursesWithProgress;
    }
  }

  getInProgressCount(): number {
    // Count all courses that are not completed (including 0%)
    return this.coursesWithProgress.filter(c => c.completionPercentage < 100).length;
  }

  getCompletedCount(): number {
    return this.coursesWithProgress.filter(c => c.completionPercentage === 100).length;
  }

  formatTimeSpent(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  getAchievementEmoji(iconName: string): string {
    const emojiMap: { [key: string]: string } = {
      'trophy': '🏆',
      'fire': '🔥',
      'star': '⭐',
      'medal': '🏅',
      'book': '📚'
    };
    return emojiMap[iconName] || '🎯';
  }

  getCompletionRate(): number {
    if (!this.stats || this.stats.totalCourses === 0) return 0;
    return Math.round((this.stats.completedCourses / this.stats.totalCourses) * 100);
  }
}

