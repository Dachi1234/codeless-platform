import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  totalCourses: number;
  completedCourses: number;
  learningTimeHours: number;
  currentStreak: number;
}

export interface Achievement {
  id: number;
  code: string;
  name: string;
  description: string;
  iconName: string;
  earnedAt: string;
}

export interface CourseProgress {
  id: number;
  enrollmentId: number;
  course: any; // Full course object
  lessonCompleted: number;
  lessonTotal: number;
  timeSpentSeconds: number;
  completionPercentage: number;
  lastAccessedAt?: string;
  enrolledAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly baseUrl = '/api/dashboard';

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/stats`);
  }

  getAchievements(): Observable<Achievement[]> {
    return this.http.get<Achievement[]>(`${this.baseUrl}/achievements`);
  }

  getCoursesWithProgress(): Observable<CourseProgress[]> {
    return this.http.get<CourseProgress[]>(`${this.baseUrl}/courses`);
  }
}

