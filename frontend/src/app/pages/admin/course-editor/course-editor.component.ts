import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface CourseForm {
  title: string;
  slug: string;
  description: string;
  kind: string;
  category: string;
  level: string;
  price: number;
  originalPrice: number;
  instructorName: string;
  instructorTitle: string;
  instructorBio: string;
  durationHours: number;
  maxStudents: number;
  startDate: string | null;
  endDate: string | null;
  sessionCount: number;
  published: boolean;
}

@Component({
  selector: 'app-course-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './course-editor.component.html',
  styleUrls: ['./course-editor.component.scss']
})
export class CourseEditorComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  courseId: number | null = null;
  isEditMode = false;
  loading = false;
  saving = false;

  form: CourseForm = {
    title: '',
    slug: '',
    description: '',
    kind: 'PRE_RECORDED',
    category: '',
    level: 'ALL_LEVELS',
    price: 0,
    originalPrice: 0,
    instructorName: '',
    instructorTitle: '',
    instructorBio: '',
    durationHours: 0,
    maxStudents: 50,
    startDate: null,
    endDate: null,
    sessionCount: 0,
    published: false
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.courseId = Number(id);
      this.isEditMode = true;
      this.loadCourse();
    }
  }

  loadCourse(): void {
    if (!this.courseId) return;

    this.loading = true;
    this.http.get<any>(`/api/admin/courses/${this.courseId}`).subscribe({
      next: (course) => {
        this.form = {
          title: course.title,
          slug: course.slug,
          description: course.description,
          kind: course.kind,
          category: course.category,
          level: course.level,
          price: course.price,
          originalPrice: course.originalPrice,
          instructorName: course.instructorName,
          instructorTitle: course.instructorTitle,
          instructorBio: course.instructorBio,
          durationHours: course.durationHours,
          maxStudents: course.maxStudents,
          startDate: course.startDate,
          endDate: course.endDate,
          sessionCount: course.sessionCount,
          published: course.published
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading course:', err);
        this.loading = false;
        alert('Failed to load course');
        this.router.navigate(['/admin/courses']);
      }
    });
  }

  onTitleChange(): void {
    // Auto-generate slug from title
    if (!this.isEditMode) {
      this.form.slug = this.form.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
  }

  save(): void {
    if (!this.form.title || !this.form.slug) {
      alert('Title and slug are required');
      return;
    }

    this.saving = true;
    const request = this.isEditMode
      ? this.http.put(`/api/admin/courses/${this.courseId}`, this.form)
      : this.http.post('/api/admin/courses', this.form);

    request.subscribe({
      next: () => {
        this.saving = false;
        alert(this.isEditMode ? 'Course updated successfully' : 'Course created successfully');
        this.router.navigate(['/admin/courses']);
      },
      error: (err) => {
        console.error('Error saving course:', err);
        this.saving = false;
        alert('Failed to save course');
      }
    });
  }
}

