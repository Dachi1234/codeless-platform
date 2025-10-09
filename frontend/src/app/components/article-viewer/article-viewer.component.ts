import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface ArticleContent {
  id: number;
  content: string;
  estimatedReadTime: number;
}

@Component({
  selector: 'app-article-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './article-viewer.component.html',
  styleUrls: ['./article-viewer.component.scss']
})
export class ArticleViewerComponent implements OnInit, OnChanges, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);

  @Input() lessonId!: number;

  loading = true;
  articleContent: SafeHtml = '';
  estimatedReadTime: number = 0;
  error = false;
  private startTime = 0;
  private completionTimer: any;

  ngOnInit(): void {
    this.loadArticle();
    this.startTime = Date.now();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lessonId'] && !changes['lessonId'].firstChange) {
      // Clear previous completion timer
      if (this.completionTimer) {
        clearTimeout(this.completionTimer);
      }
      this.startTime = Date.now();
      this.loadArticle();
    }
  }

  ngOnDestroy(): void {
    if (this.completionTimer) {
      clearTimeout(this.completionTimer);
    }
  }

  loadArticle(): void {
    if (!this.lessonId) {
      this.loading = false;
      this.error = true;
      return;
    }

    this.loading = true;
    this.error = false;

    this.http.get<ArticleContent>(`/api/articles/lesson/${this.lessonId}`).subscribe({
      next: (article) => {
        // Sanitize HTML content to prevent XSS attacks
        this.articleContent = this.sanitizer.bypassSecurityTrustHtml(article.content);
        this.estimatedReadTime = article.estimatedReadTime || 1;
        this.loading = false;
        
        // Auto-complete article after estimated read time + 10 seconds
        const autoCompleteDelay = (this.estimatedReadTime * 60 + 10) * 1000;
        this.completionTimer = setTimeout(() => {
          this.markArticleComplete();
        }, autoCompleteDelay);
      },
      error: (err) => {
        console.error('Error loading article:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  markArticleComplete(): void {
    const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
    
    this.http.post(`/api/lessons/${this.lessonId}/complete`, {
      positionSeconds: 0,
      timeSpentSeconds: timeSpent
    }).subscribe({
      next: () => {
        console.log('Article marked as complete');
      },
      error: (err) => {
        console.error('Error marking article complete:', err);
      }
    });
  }
}

