import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface AdminCourse {
  id: number;
  title: string;
  slug: string;
  kind: string;
  category: string;
  level: string;
  price: number;
  enrolledCount: number;
  published: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-courses.component.html',
  styleUrls: ['./admin-courses.component.scss']
})
export class AdminCoursesComponent implements OnInit {
  private readonly http = inject(HttpClient);

  courses: AdminCourse[] = [];
  loading = true;
  searchTerm = '';
  selectedKind = '';
  selectedCategory = '';

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    let url = '/api/admin/courses?';
    if (this.searchTerm) url += `q=${this.searchTerm}&`;
    if (this.selectedKind) url += `kind=${this.selectedKind}&`;
    if (this.selectedCategory) url += `category=${this.selectedCategory}&`;

    this.http.get<AdminCourse[]>(url).subscribe({
      next: (data) => {
        this.courses = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading courses:', err);
        this.loading = false;
      }
    });
  }

  deleteCourse(id: number): void {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    this.http.delete(`/api/admin/courses/${id}`).subscribe({
      next: () => {
        this.courses = this.courses.filter(c => c.id !== id);
        alert('Course deleted successfully');
      },
      error: (err) => {
        console.error('Error deleting course:', err);
        alert('Failed to delete course');
      }
    });
  }

  togglePublish(course: AdminCourse): void {
    this.http.patch(`/api/admin/courses/${course.id}/publish`, { published: !course.published }).subscribe({
      next: () => {
        course.published = !course.published;
      },
      error: (err) => {
        console.error('Error toggling publish status:', err);
        alert('Failed to update publish status');
      }
    });
  }

  onSearch(): void {
    this.loading = true;
    this.loadCourses();
  }
}

