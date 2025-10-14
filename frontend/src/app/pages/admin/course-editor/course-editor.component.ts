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
  imageUrl?: string;
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
  uploadingImage = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

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
    published: false,
    imageUrl: ''
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
          // Convert ISO dates to datetime-local format for input fields
          startDate: course.startDate ? this.toDatetimeLocalString(course.startDate) : null,
          endDate: course.endDate ? this.toDatetimeLocalString(course.endDate) : null,
          sessionCount: course.sessionCount,
          published: course.published,
          imageUrl: course.imageUrl || ''
        };
        this.imagePreview = course.imageUrl || null;
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

    // Prepare form data with proper date formatting for LIVE courses
    const formData = { ...this.form };
    
    // Convert datetime-local strings to ISO format with timezone
    if (formData.startDate && typeof formData.startDate === 'string') {
      formData.startDate = new Date(formData.startDate).toISOString();
    }
    if (formData.endDate && typeof formData.endDate === 'string') {
      formData.endDate = new Date(formData.endDate).toISOString();
    }

    const request = this.isEditMode
      ? this.http.put(`/api/admin/courses/${this.courseId}`, formData)
      : this.http.post('/api/admin/courses', formData);

    request.subscribe({
      next: () => {
        this.saving = false;
        alert(this.isEditMode ? 'Course updated successfully' : 'Course created successfully');
        this.router.navigate(['/admin/courses']);
      },
      error: (err) => {
        console.error('Error saving course:', err);
        this.saving = false;
        alert('Failed to save course: ' + (err.error?.message || err.message));
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }

      this.selectedFile = file;

      // Preview image
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadImage(): void {
    if (!this.selectedFile) {
      alert('Please select an image first');
      return;
    }

    if (!this.courseId) {
      alert('Please save the course first before uploading an image');
      return;
    }

    this.uploadingImage = true;
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post<any>(`/api/admin/courses/${this.courseId}/upload-image`, formData).subscribe({
      next: (response) => {
        this.uploadingImage = false;
        this.form.imageUrl = response.imageUrl;
        this.imagePreview = response.imageUrl;
        this.selectedFile = null;
        alert('Image uploaded successfully!');
      },
      error: (err) => {
        console.error('Error uploading image:', err);
        this.uploadingImage = false;
        alert('Failed to upload image: ' + (err.error?.error || err.message));
      }
    });
  }

  removeImage(): void {
    if (!confirm('Are you sure you want to remove this image?')) {
      return;
    }

    // If editing an existing course, call the backend to remove the image
    if (this.isEditMode && this.courseId && this.form.imageUrl) {
      this.http.delete(`/api/admin/courses/${this.courseId}/image`).subscribe({
        next: () => {
          this.selectedFile = null;
          this.imagePreview = null;
          this.form.imageUrl = '';
          alert('Image removed successfully');
        },
        error: (err) => {
          console.error('Error removing image:', err);
          alert('Failed to remove image: ' + (err.error?.error || err.message));
        }
      });
    } else {
      // For new courses or if no image was uploaded yet, just clear the preview
      this.selectedFile = null;
      this.imagePreview = null;
      this.form.imageUrl = '';
    }
  }

  // Convert ISO string to datetime-local format (YYYY-MM-DDTHH:mm)
  private toDatetimeLocalString(isoString: string): string {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}

