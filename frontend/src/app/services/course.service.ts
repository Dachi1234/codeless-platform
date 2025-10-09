import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type Course = {
  id: number;
  title: string;
  slug?: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  kind?: string;
  level?: string;
  instructorName?: string;
  instructorTitle?: string;
  instructorAvatarUrl?: string;
  rating?: number;
  reviewCount?: number;
  lessonCount?: number;
  durationHours?: number;
  startDate?: string;
  endDate?: string;
  sessionCount?: number;
  maxStudents?: number;
  enrolledCount?: number;
  featured?: boolean;
  category?: string;
  tags?: string;
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

@Injectable({ providedIn: 'root' })
export class CourseService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/courses';

  list(params?: { q?: string; kind?: string; category?: string; level?: string; minPrice?: number; maxPrice?: number; sort?: string; page?: number; size?: number; }): Observable<Course[]> {
    let httpParams = new HttpParams();
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== '') {
          httpParams = httpParams.set(k, String(v));
        }
      }
    }
    return this.http.get<PageResponse<Course>>(this.baseUrl, { params: httpParams }).pipe(
      map(response => response.content)
    );
  }

  get(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.baseUrl}/${id}`);
  }
}
