import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface LiveSession {
  id?: number;
  courseId?: number;
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
  id?: number;
  liveSessionId?: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSizeKb: number;
  uploadedAt?: string;
}

@Component({
  selector: 'app-live-sessions-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './live-sessions-editor.component.html',
  styleUrls: ['./live-sessions-editor.component.scss']
})
export class LiveSessionsEditorComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  courseId!: number;
  sessions: LiveSession[] = [];
  materials: Map<number, SessionMaterial[]> = new Map();
  loading = false;
  saving = false;
  uploadingMaterial = false;

  // Modal state
  showSessionModal = false;
  editingSession: LiveSession | null = null;
  sessionForm: LiveSession = this.getEmptySession();

  // Material upload state
  selectedSessionForMaterial: number | null = null;
  selectedMaterialFile: File | null = null;

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadSessions();
  }

  getEmptySession(): LiveSession {
    return {
      sessionNumber: 1,
      title: '',
      description: '',
      scheduledAt: '',
      durationMinutes: 90,
      zoomLink: '',
      status: 'SCHEDULED'
    };
  }

  loadSessions(): void {
    this.loading = true;
    this.http.get<LiveSession[]>(`/api/courses/${this.courseId}/sessions`).subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        this.loading = false;
        // Load materials for each session
        sessions.forEach(session => {
          if (session.id) {
            this.loadMaterialsForSession(session.id);
          }
        });
      },
      error: (err) => {
        console.error('Error loading sessions:', err);
        this.loading = false;
      }
    });
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

  openCreateModal(): void {
    this.editingSession = null;
    this.sessionForm = this.getEmptySession();
    // Auto-set session number
    this.sessionForm.sessionNumber = this.sessions.length + 1;
    this.showSessionModal = true;
  }

  openEditModal(session: LiveSession): void {
    this.editingSession = session;
    this.sessionForm = { ...session };
    this.showSessionModal = true;
  }

  closeSessionModal(): void {
    this.showSessionModal = false;
    this.editingSession = null;
    this.sessionForm = this.getEmptySession();
  }

  saveSession(): void {
    if (!this.sessionForm.title || !this.sessionForm.scheduledAt) {
      alert('Please fill in all required fields');
      return;
    }

    this.saving = true;

    // Prepare session data with proper date formatting
    const sessionData = { ...this.sessionForm };
    
    // Convert datetime-local strings to ISO format with timezone
    if (sessionData.scheduledAt && typeof sessionData.scheduledAt === 'string') {
      sessionData.scheduledAt = new Date(sessionData.scheduledAt).toISOString();
    }

    const request = this.editingSession
      ? this.http.put<LiveSession>(`/api/admin/sessions/${this.editingSession.id}`, sessionData)
      : this.http.post<LiveSession>(`/api/admin/courses/${this.courseId}/sessions`, sessionData);

    request.subscribe({
      next: (session) => {
        this.loadSessions();
        this.closeSessionModal();
        this.saving = false;
      },
      error: (err) => {
        console.error('Error saving session:', err);
        alert('Failed to save session: ' + (err.error?.message || err.message));
        this.saving = false;
      }
    });
  }

  deleteSession(session: LiveSession): void {
    if (!confirm(`Are you sure you want to delete "${session.title}"?`)) {
      return;
    }

    this.http.delete(`/api/admin/sessions/${session.id}`).subscribe({
      next: () => {
        this.loadSessions();
      },
      error: (err) => {
        console.error('Error deleting session:', err);
        alert('Failed to delete session');
      }
    });
  }

  updateSessionStatus(session: LiveSession, newStatus: LiveSession['status']): void {
    this.http.patch(`/api/admin/sessions/${session.id}/status?status=${newStatus}`, {}).subscribe({
      next: () => {
        session.status = newStatus;
      },
      error: (err) => {
        console.error('Error updating status:', err);
        alert('Failed to update status');
      }
    });
  }

  // Material upload methods
  openMaterialUpload(sessionId: number): void {
    this.selectedSessionForMaterial = sessionId;
  }

  onMaterialFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedMaterialFile = input.files[0];
    }
  }

  uploadMaterial(sessionId: number): void {
    if (!this.selectedMaterialFile) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedMaterialFile);

    this.uploadingMaterial = true;

    this.http.post(`/api/admin/sessions/${sessionId}/materials`, formData).subscribe({
      next: (response: any) => {
        this.loadMaterialsForSession(sessionId);
        this.selectedMaterialFile = null;
        this.uploadingMaterial = false;
        // Reset file input
        const fileInput = document.getElementById(`material-file-${sessionId}`) as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      },
      error: (err) => {
        console.error('Error uploading material:', err);
        alert('Failed to upload material: ' + (err.error?.error || err.message));
        this.uploadingMaterial = false;
      }
    });
  }

  deleteMaterial(materialId: number, sessionId: number): void {
    if (!confirm('Are you sure you want to delete this material?')) {
      return;
    }

    this.http.delete(`/api/admin/materials/${materialId}`).subscribe({
      next: () => {
        this.loadMaterialsForSession(sessionId);
      },
      error: (err) => {
        console.error('Error deleting material:', err);
        alert('Failed to delete material');
      }
    });
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

  formatDateTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  getFileIcon(fileType: string): string {
    switch (fileType) {
      case 'pdf': return '📄';
      case 'word': return '📝';
      case 'excel': return '📊';
      case 'powerpoint': return '📽️';
      case 'image': return '🖼️';
      case 'html': return '🌐';
      case 'archive': return '📦';
      default: return '📎';
    }
  }

  formatFileSize(sizeKb: number): string {
    if (sizeKb < 1024) {
      return `${sizeKb} KB`;
    }
    return `${(sizeKb / 1024).toFixed(2)} MB`;
  }
}

