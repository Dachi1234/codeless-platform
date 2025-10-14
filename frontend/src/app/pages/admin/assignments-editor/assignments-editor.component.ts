import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Assignment {
  id?: number;
  courseId?: number;
  liveSessionId?: number;
  title: string;
  description: string;
  dueDate: string;
  maxFileSizeMb: number;
  allowedFileTypes: string;
  maxGrade: number;
}

interface Submission {
  id?: number;
  assignmentId?: number;
  user?: {
    id: number;
    fullName: string;
    email: string;
  };
  fileName: string;
  fileUrl: string;
  submittedAt: string;
  isLate: boolean;
  daysLate: number;
  grade?: number;
  feedback?: string;
  gradedAt?: string;
}

interface LiveSession {
  id: number;
  sessionNumber: number;
  title: string;
}

@Component({
  selector: 'app-assignments-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assignments-editor.component.html',
  styleUrls: ['./assignments-editor.component.scss']
})
export class AssignmentsEditorComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  courseId!: number;
  assignments: Assignment[] = [];
  sessions: LiveSession[] = [];
  loading = false;
  saving = false;

  // Modal state
  showAssignmentModal = false;
  editingAssignment: Assignment | null = null;
  assignmentForm: Assignment = this.getEmptyAssignment();

  // Grading state
  showGradingModal = false;
  viewingAssignment: Assignment | null = null;
  submissions: Submission[] = [];
  loadingSubmissions = false;
  gradingSubmission: Submission | null = null;
  gradeForm = {
    grade: 0,
    feedback: ''
  };

  // File type options
  fileTypeOptions = [
    { value: 'pdf', label: 'PDF' },
    { value: 'doc', label: 'Word (DOC)' },
    { value: 'docx', label: 'Word (DOCX)' },
    { value: 'xls', label: 'Excel (XLS)' },
    { value: 'xlsx', label: 'Excel (XLSX)' },
    { value: 'ppt', label: 'PowerPoint (PPT)' },
    { value: 'pptx', label: 'PowerPoint (PPTX)' },
    { value: 'txt', label: 'Text' },
    { value: 'zip', label: 'ZIP Archive' },
    { value: 'jpg', label: 'Image (JPG)' },
    { value: 'png', label: 'Image (PNG)' }
  ];

  selectedFileTypes: Set<string> = new Set();

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAssignments();
    this.loadSessions();
  }

  getEmptyAssignment(): Assignment {
    return {
      title: '',
      description: '',
      dueDate: '',
      maxFileSizeMb: 50,
      allowedFileTypes: 'pdf,docx,zip',
      maxGrade: 100
    };
  }

  loadAssignments(): void {
    this.loading = true;
    this.http.get<Assignment[]>(`/api/courses/${this.courseId}/assignments`).subscribe({
      next: (assignments) => {
        this.assignments = assignments;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading assignments:', err);
        this.loading = false;
      }
    });
  }

  loadSessions(): void {
    this.http.get<LiveSession[]>(`/api/courses/${this.courseId}/sessions`).subscribe({
      next: (sessions) => {
        this.sessions = sessions;
      },
      error: (err) => {
        console.error('Error loading sessions:', err);
      }
    });
  }

  openCreateModal(): void {
    this.editingAssignment = null;
    this.assignmentForm = this.getEmptyAssignment();
    this.selectedFileTypes = new Set(this.assignmentForm.allowedFileTypes.split(','));
    this.showAssignmentModal = true;
  }

  openEditModal(assignment: Assignment): void {
    this.editingAssignment = assignment;
    this.assignmentForm = { ...assignment };
    this.selectedFileTypes = new Set(this.assignmentForm.allowedFileTypes.split(','));
    this.showAssignmentModal = true;
  }

  closeAssignmentModal(): void {
    this.showAssignmentModal = false;
    this.editingAssignment = null;
    this.assignmentForm = this.getEmptyAssignment();
    this.selectedFileTypes.clear();
  }

  toggleFileType(type: string): void {
    if (this.selectedFileTypes.has(type)) {
      this.selectedFileTypes.delete(type);
    } else {
      this.selectedFileTypes.add(type);
    }
    this.assignmentForm.allowedFileTypes = Array.from(this.selectedFileTypes).join(',');
  }

  saveAssignment(): void {
    if (!this.assignmentForm.title || !this.assignmentForm.dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    if (this.selectedFileTypes.size === 0) {
      alert('Please select at least one allowed file type');
      return;
    }

    this.saving = true;

    const request = this.editingAssignment
      ? this.http.put<Assignment>(`/api/admin/assignments/${this.editingAssignment.id}`, this.assignmentForm)
      : this.http.post<Assignment>(`/api/admin/courses/${this.courseId}/assignments`, this.assignmentForm);

    request.subscribe({
      next: () => {
        this.loadAssignments();
        this.closeAssignmentModal();
        this.saving = false;
      },
      error: (err) => {
        console.error('Error saving assignment:', err);
        alert('Failed to save assignment: ' + (err.error?.message || err.message));
        this.saving = false;
      }
    });
  }

  deleteAssignment(assignment: Assignment): void {
    if (!confirm(`Are you sure you want to delete "${assignment.title}"?`)) {
      return;
    }

    this.http.delete(`/api/admin/assignments/${assignment.id}`).subscribe({
      next: () => {
        this.loadAssignments();
      },
      error: (err) => {
        console.error('Error deleting assignment:', err);
        alert('Failed to delete assignment');
      }
    });
  }

  openGradingModal(assignment: Assignment): void {
    this.viewingAssignment = assignment;
    this.loadSubmissions(assignment.id!);
    this.showGradingModal = true;
  }

  closeGradingModal(): void {
    this.showGradingModal = false;
    this.viewingAssignment = null;
    this.submissions = [];
    this.gradingSubmission = null;
  }

  loadSubmissions(assignmentId: number): void {
    this.loadingSubmissions = true;
    this.http.get<Submission[]>(`/api/admin/assignments/${assignmentId}/submissions`).subscribe({
      next: (submissions) => {
        this.submissions = submissions;
        this.loadingSubmissions = false;
      },
      error: (err) => {
        console.error('Error loading submissions:', err);
        this.loadingSubmissions = false;
      }
    });
  }

  startGrading(submission: Submission): void {
    this.gradingSubmission = submission;
    this.gradeForm = {
      grade: submission.grade || 0,
      feedback: submission.feedback || ''
    };
  }

  cancelGrading(): void {
    this.gradingSubmission = null;
    this.gradeForm = { grade: 0, feedback: '' };
  }

  submitGrade(): void {
    if (!this.gradingSubmission) return;

    if (this.gradeForm.grade < 0 || this.gradeForm.grade > (this.viewingAssignment?.maxGrade || 100)) {
      alert(`Grade must be between 0 and ${this.viewingAssignment?.maxGrade}`);
      return;
    }

    this.http.post(`/api/admin/submissions/${this.gradingSubmission.id}/grade`, this.gradeForm).subscribe({
      next: () => {
        this.loadSubmissions(this.viewingAssignment!.id!);
        this.cancelGrading();
      },
      error: (err) => {
        console.error('Error submitting grade:', err);
        alert('Failed to submit grade');
      }
    });
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  formatDueDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const isOverdue = date < now;
    return isOverdue ? `⚠️ ${date.toLocaleString()} (Overdue)` : date.toLocaleString();
  }

  isOverdue(dateString: string): boolean {
    return new Date(dateString) < new Date();
  }

  getSubmissionStatus(submission: Submission): string {
    if (submission.grade !== undefined && submission.grade !== null) {
      return 'Graded';
    }
    if (submission.isLate) {
      return `Late (${submission.daysLate} days)`;
    }
    return 'Submitted';
  }

  getStatusClass(submission: Submission): string {
    if (submission.grade !== undefined && submission.grade !== null) {
      return 'status-graded';
    }
    if (submission.isLate) {
      return 'status-late';
    }
    return 'status-submitted';
  }

  getSessionTitle(sessionId: number | undefined): string {
    if (!sessionId) return 'General Assignment';
    const session = this.sessions.find(s => s.id === sessionId);
    return session ? `Session ${session.sessionNumber}: ${session.title}` : 'Unknown Session';
  }
}

