import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Course {
  id: number;
  title: string;
  instructorName: string;
  instructorTitle: string;
}

interface LiveSession {
  id: number;
  sessionNumber: number;
  title: string;
  description: string;
  scheduledAt: string;
  durationMinutes: number;
  zoomLink: string;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  recordingUrl?: string;
}

interface SessionMaterial {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSizeKb: number;
  uploadedAt: string;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  allowedFileTypes: string;
  maxFileSizeMb: number;
  maxGrade: number;
  mySubmission?: Submission;
}

interface Submission {
  id: number;
  fileName: string;
  fileUrl: string;
  submittedAt: string;
  isLate: boolean;
  daysLate: number;
  grade?: number;
  feedback?: string;
  gradedAt?: string;
}

@Component({
  selector: 'app-live-course-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './live-course-view.component.html',
  styleUrls: ['./live-course-view.component.scss']
})
export class LiveCourseViewComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  courseId!: number;
  course: Course | null = null;
  activeTab: 'schedule' | 'assignments' = 'schedule';

  // Schedule tab
  sessions: LiveSession[] = [];
  upcomingSessions: LiveSession[] = [];
  pastSessions: LiveSession[] = [];
  materials: Map<number, SessionMaterial[]> = new Map();
  loadingSessions = false;

  // Assignments tab
  assignments: Assignment[] = [];
  loadingAssignments = false;
  uploadingFile = false;
  selectedFile: File | null = null;
  selectedAssignmentId: number | null = null;

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCourse();
    this.loadSessions();
    this.loadAssignments();
  }

  loadCourse(): void {
    this.http.get<Course>(`/api/courses/${this.courseId}`).subscribe({
      next: (course) => {
        this.course = course;
      },
      error: (err) => {
        console.error('Error loading course:', err);
      }
    });
  }

  loadSessions(): void {
    this.loadingSessions = true;
    this.http.get<LiveSession[]>(`/api/courses/${this.courseId}/sessions`).subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        this.categorizeSessions();
        this.loadingSessions = false;

        // Load materials for each session
        sessions.forEach(session => {
          this.loadMaterialsForSession(session.id);
        });
      },
      error: (err) => {
        console.error('Error loading sessions:', err);
        this.loadingSessions = false;
      }
    });
  }

  categorizeSessions(): void {
    const now = new Date();
    this.upcomingSessions = this.sessions.filter(s => new Date(s.scheduledAt) > now && s.status !== 'CANCELLED');
    this.pastSessions = this.sessions.filter(s => new Date(s.scheduledAt) <= now || s.status === 'COMPLETED');
  }

  loadMaterialsForSession(sessionId: number): void {
    this.http.get<SessionMaterial[]>(`/api/sessions/${sessionId}/materials`).subscribe({
      next: (materials) => {
        this.materials.set(sessionId, materials);
      },
      error: (err) => {
        console.error(`Error loading materials for session ${sessionId}:`, err);
      }
    });
  }

  loadAssignments(): void {
    this.loadingAssignments = true;
    this.http.get<Assignment[]>(`/api/courses/${this.courseId}/assignments`).subscribe({
      next: (assignments) => {
        this.assignments = assignments;
        this.loadingAssignments = false;

        // Load my submissions for each assignment
        assignments.forEach(assignment => {
          this.loadMySubmission(assignment.id);
        });
      },
      error: (err) => {
        console.error('Error loading assignments:', err);
        this.loadingAssignments = false;
      }
    });
  }

  loadMySubmission(assignmentId: number): void {
    this.http.get<Submission>(`/api/assignments/${assignmentId}/my-submission`).subscribe({
      next: (submission) => {
        const assignment = this.assignments.find(a => a.id === assignmentId);
        if (assignment) {
          assignment.mySubmission = submission;
        }
      },
      error: (err) => {
        // No submission yet, that's okay
        if (err.status !== 404) {
          console.error(`Error loading submission for assignment ${assignmentId}:`, err);
        }
      }
    });
  }

  switchTab(tab: 'schedule' | 'assignments'): void {
    this.activeTab = tab;
  }

  onFileSelected(event: Event, assignmentId: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.selectedAssignmentId = assignmentId;
    }
  }

  submitAssignment(assignment: Assignment): void {
    if (!this.selectedFile || this.selectedAssignmentId !== assignment.id) {
      alert('Please select a file to upload');
      return;
    }

    // Validate file size
    const fileSizeMb = this.selectedFile.size / (1024 * 1024);
    if (fileSizeMb > assignment.maxFileSizeMb) {
      alert(`File size exceeds the limit of ${assignment.maxFileSizeMb} MB`);
      return;
    }

    // Validate file type
    const fileExtension = this.selectedFile.name.split('.').pop()?.toLowerCase();
    const allowedTypes = assignment.allowedFileTypes.split(',');
    if (fileExtension && !allowedTypes.includes(fileExtension)) {
      alert(`File type .${fileExtension} is not allowed. Allowed types: ${assignment.allowedFileTypes}`);
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.uploadingFile = true;

    this.http.post(`/api/assignments/${assignment.id}/submit`, formData).subscribe({
      next: (response: any) => {
        alert('Assignment submitted successfully!');
        this.loadMySubmission(assignment.id);
        this.selectedFile = null;
        this.selectedAssignmentId = null;
        this.uploadingFile = false;

        // Reset file input
        const fileInput = document.getElementById(`assignment-file-${assignment.id}`) as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      },
      error: (err) => {
        console.error('Error submitting assignment:', err);
        alert('Failed to submit assignment: ' + (err.error?.error || err.message));
        this.uploadingFile = false;
      }
    });
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  formatDueDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const isOverdue = date < now;
    const formatted = this.formatDateTime(dateString);
    return isOverdue ? `⚠️ ${formatted} (Overdue)` : formatted;
  }

  isOverdue(dateString: string): boolean {
    return new Date(dateString) < new Date();
  }

  isUpcoming(dateString: string): boolean {
    const sessionDate = new Date(dateString);
    const now = new Date();
    const hoursDiff = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDiff > 0 && hoursDiff <= 24; // Within next 24 hours
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'SCHEDULED': return 'status-scheduled';
      case 'LIVE': return 'status-live';
      case 'COMPLETED': return 'status-completed';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  }

  getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('doc')) return '📝';
    if (fileType.includes('excel') || fileType.includes('xls')) return '📊';
    if (fileType.includes('powerpoint') || fileType.includes('ppt')) return '📽️';
    if (fileType.includes('image') || fileType.includes('jpg') || fileType.includes('png')) return '🖼️';
    if (fileType.includes('html')) return '🌐';
    if (fileType.includes('zip') || fileType.includes('archive')) return '📦';
    return '📎';
  }

  formatFileSize(sizeKb: number): string {
    if (sizeKb < 1024) {
      return `${sizeKb} KB`;
    }
    return `${(sizeKb / 1024).toFixed(2)} MB`;
  }

  getAcceptedFileTypes(allowedTypes: string): string {
    return allowedTypes.split(',').map(t => '.' + t.trim()).join(',');
  }
}

