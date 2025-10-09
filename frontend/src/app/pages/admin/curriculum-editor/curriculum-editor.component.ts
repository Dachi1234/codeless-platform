import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ArticleEditorComponent } from '../../../components/article-editor/article-editor.component';
import { QuizBuilderComponent } from '../../../components/quiz-builder/quiz-builder.component';

interface Section {
  id: number;
  title: string;
  description: string;
  sectionOrder: number;
  lessons: Lesson[];
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  lessonType: string;
  contentUrl: string;
  durationMinutes: number;
  lessonOrder: number;
  isPreview: boolean;
}

@Component({
  selector: 'app-curriculum-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ArticleEditorComponent, QuizBuilderComponent],
  templateUrl: './curriculum-editor.component.html',
  styleUrls: ['./curriculum-editor.component.scss']
})
export class CurriculumEditorComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  courseId!: number;
  courseName = '';
  sections: Section[] = [];
  loading = true;

  // Modal states
  showSectionModal = false;
  showLessonModal = false;
  showArticleEditor = false;
  showQuizBuilder = false;
  editingSection: Section | null = null;
  editingSectionId: number | null = null;
  editingLesson: Lesson | null = null;
  editingArticleLessonId: number | null = null;
  editingQuizLessonId: number | null = null;

  // Form models
  sectionForm = {
    title: '',
    description: '',
    sectionOrder: 1
  };

  lessonForm = {
    title: '',
    description: '',
    lessonType: 'VIDEO',
    contentUrl: '',
    durationMinutes: 0,
    lessonOrder: 1,
    isPreview: false
  };

  lessonTypes = [
    { value: 'VIDEO', label: 'Video' },
    { value: 'ARTICLE', label: 'Article' },
    { value: 'QUIZ', label: 'Quiz' },
    { value: 'EXERCISE', label: 'Exercise' }
  ];

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCurriculum();
    this.loadCourseInfo();
  }

  loadCourseInfo(): void {
    this.http.get<any>(`/api/admin/courses/${this.courseId}`).subscribe({
      next: (course) => {
        this.courseName = course.title;
      },
      error: (err) => {
        console.error('Error loading course info:', err);
      }
    });
  }

  loadCurriculum(): void {
    this.http.get<{sections: Section[]}>(`/api/courses/${this.courseId}/curriculum`).subscribe({
      next: (response) => {
        this.sections = response.sections;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading curriculum:', err);
        this.loading = false;
      }
    });
  }

  // ============== SECTION CRUD ==============

  openAddSectionModal(): void {
    this.editingSection = null;
    this.sectionForm = {
      title: '',
      description: '',
      sectionOrder: this.sections.length + 1
    };
    this.showSectionModal = true;
  }

  openEditSectionModal(section: Section): void {
    this.editingSection = section;
    this.sectionForm = {
      title: section.title,
      description: section.description,
      sectionOrder: section.sectionOrder
    };
    this.showSectionModal = true;
  }

  saveSectionSubmit(): void {
    if (this.editingSection) {
      this.updateSection();
    } else {
      this.createSection();
    }
  }

  createSection(): void {
    // Don't send sectionOrder - let backend calculate it
    const payload = {
      title: this.sectionForm.title,
      description: this.sectionForm.description
      // sectionOrder is intentionally omitted
    };

    this.http.post<Section>(`/api/admin/courses/${this.courseId}/sections`, payload).subscribe({
      next: () => {
        this.loadCurriculum();
        this.closeSectionModal();
      },
      error: (err) => {
        console.error('Error creating section:', err);
        alert('Failed to create section: ' + (err.error?.message || err.message));
      }
    });
  }

  updateSection(): void {
    if (!this.editingSection) return;
    
    this.http.put(`/api/admin/sections/${this.editingSection.id}`, this.sectionForm).subscribe({
      next: () => {
        this.loadCurriculum();
        this.closeSectionModal();
      },
      error: (err) => {
        console.error('Error updating section:', err);
        alert('Failed to update section');
      }
    });
  }

  deleteSection(section: Section): void {
    if (!confirm(`Delete section "${section.title}" and all its lessons?`)) return;

    this.http.delete(`/api/admin/sections/${section.id}`).subscribe({
      next: () => {
        this.loadCurriculum();
      },
      error: (err) => {
        console.error('Error deleting section:', err);
        alert('Failed to delete section');
      }
    });
  }

  closeSectionModal(): void {
    this.showSectionModal = false;
    this.editingSection = null;
  }

  // ============== LESSON CRUD ==============

  openAddLessonModal(section: Section): void {
    this.editingLesson = null;
    this.editingSectionId = section.id;
    this.lessonForm = {
      title: '',
      description: '',
      lessonType: 'VIDEO',
      contentUrl: '',
      durationMinutes: 0,
      lessonOrder: section.lessons.length + 1,
      isPreview: false
    };
    this.showLessonModal = true;
  }

  openEditLessonModal(lesson: Lesson): void {
    this.editingLesson = lesson;
    this.lessonForm = {
      title: lesson.title,
      description: lesson.description,
      lessonType: lesson.lessonType,
      contentUrl: lesson.contentUrl || '',
      durationMinutes: lesson.durationMinutes || 0,
      lessonOrder: lesson.lessonOrder,
      isPreview: lesson.isPreview
    };
    this.showLessonModal = true;
  }

  saveLessonSubmit(): void {
    if (this.editingLesson) {
      this.updateLesson();
    } else {
      this.createLesson();
    }
  }

  createLesson(): void {
    if (!this.editingSectionId) return;

    // Don't send lessonOrder - let backend calculate it
    const payload = {
      title: this.lessonForm.title,
      description: this.lessonForm.description,
      lessonType: this.lessonForm.lessonType,
      contentUrl: this.lessonForm.contentUrl,
      durationMinutes: this.lessonForm.durationMinutes,
      isPreview: this.lessonForm.isPreview
      // lessonOrder is intentionally omitted
    };

    this.http.post<Lesson>(`/api/admin/sections/${this.editingSectionId}/lessons`, payload).subscribe({
      next: () => {
        this.loadCurriculum();
        this.closeLessonModal();
      },
      error: (err) => {
        console.error('Error creating lesson:', err);
        alert('Failed to create lesson: ' + (err.error?.message || err.message));
      }
    });
  }

  updateLesson(): void {
    if (!this.editingLesson) return;

    this.http.put(`/api/admin/lessons/${this.editingLesson.id}`, this.lessonForm).subscribe({
      next: () => {
        this.loadCurriculum();
        this.closeLessonModal();
      },
      error: (err) => {
        console.error('Error updating lesson:', err);
        alert('Failed to update lesson');
      }
    });
  }

  deleteLesson(lesson: Lesson): void {
    if (!confirm(`Delete lesson "${lesson.title}"?`)) return;

    this.http.delete(`/api/admin/lessons/${lesson.id}`).subscribe({
      next: () => {
        this.loadCurriculum();
      },
      error: (err) => {
        console.error('Error deleting lesson:', err);
        alert('Failed to delete lesson');
      }
    });
  }

  closeLessonModal(): void {
    this.showLessonModal = false;
    this.editingLesson = null;
    this.editingSectionId = null;
  }

  // ============== ARTICLE EDITOR ==============

  openArticleEditor(lesson: Lesson): void {
    this.editingArticleLessonId = lesson.id;
    this.showArticleEditor = true;
  }

  closeArticleEditor(): void {
    this.showArticleEditor = false;
    this.editingArticleLessonId = null;
  }

  onArticleSaved(): void {
    this.closeArticleEditor();
    // Optionally reload curriculum to show updated content
    this.loadCurriculum();
  }

  // ============== QUIZ BUILDER ==============

  openQuizBuilder(lesson: Lesson): void {
    this.editingQuizLessonId = lesson.id;
    this.showQuizBuilder = true;
  }

  closeQuizBuilder(): void {
    this.showQuizBuilder = false;
    this.editingQuizLessonId = null;
  }

  onQuizSaved(): void {
    this.closeQuizBuilder();
    // Optionally reload curriculum to show updated content
    this.loadCurriculum();
  }

  // ============== HELPERS ==============

  getTotalLessons(): number {
    return this.sections.reduce((total, section) => total + section.lessons.length, 0);
  }

  getTotalDuration(): number {
    return this.sections.reduce((total, section) => {
      return total + section.lessons.reduce((sum, lesson) => sum + (lesson.durationMinutes || 0), 0);
    }, 0);
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  getLessonIcon(type: string): string {
    switch (type) {
      case 'VIDEO': return '▶️';
      case 'ARTICLE': return '📄';
      case 'QUIZ': return '❓';
      case 'EXERCISE': return '✏️';
      default: return '📦';
    }
  }
}

