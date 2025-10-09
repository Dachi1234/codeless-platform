import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Course } from './course.service';

export interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  enrolledAt: string;
  course: Course;
}

export interface EnrollmentRequest {
  courseId: number;
}

export interface EnrollmentResponse {
  id: number;
  userId: number;
  courseId: number;
  enrolledAt: string;
  message?: string;
}

export interface ExistsResponse {
  exists: boolean;
}

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/enrollments';

  /**
   * Enroll the current user in a course
   */
  enroll(courseId: number): Observable<EnrollmentResponse> {
    return this.http.post<EnrollmentResponse>(this.baseUrl, { courseId });
  }

  /**
   * Get all enrollments for the current user
   */
  getMyEnrollments(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(this.baseUrl);
  }

  /**
   * Check if user is enrolled in a specific course
   */
  isEnrolled(courseId: number): Observable<boolean> {
    // Optimized: use backend existence endpoint
    return this.http
      .get<ExistsResponse>(`${this.baseUrl}/exists`, { params: { courseId } as any })
      .pipe(
        map(res => !!res?.exists),
        catchError(() => of(false))
      );
  }
}

