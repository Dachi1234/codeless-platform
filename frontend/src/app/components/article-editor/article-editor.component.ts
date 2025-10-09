import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { EditorComponent } from '@tinymce/tinymce-angular';
import { environment } from '../../../environments/environment';

interface ArticleContent {
  id?: number;
  lessonId: number;
  content: string;
  rawContent?: string;
  estimatedReadTime?: number;
}

@Component({
  selector: 'app-article-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, EditorComponent],
  templateUrl: './article-editor.component.html',
  styleUrls: ['./article-editor.component.scss']
})
export class ArticleEditorComponent implements OnInit {
  private readonly http = inject(HttpClient);

  @Input() lessonId!: number;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  articleContent: string = '';
  loading = false;
  saving = false;
  articleId: number | null = null;
  tinymceApiKey = environment.tinymceApiKey;

  // TinyMCE configuration
  editorConfig = {
    height: 500,
    menubar: true,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount', 'codesample'
    ],
    toolbar:
      'undo redo | formatselect | bold italic underline strikethrough | ' +
      'alignleft aligncenter alignright alignjustify | ' +
      'bullist numlist outdent indent | link image media codesample | ' +
      'forecolor backcolor | removeformat | help',
    content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 16px; line-height: 1.6; }',
    codesample_languages: [
      { text: 'HTML/XML', value: 'markup' },
      { text: 'JavaScript', value: 'javascript' },
      { text: 'CSS', value: 'css' },
      { text: 'TypeScript', value: 'typescript' },
      { text: 'Python', value: 'python' },
      { text: 'Java', value: 'java' },
      { text: 'C#', value: 'csharp' },
      { text: 'SQL', value: 'sql' },
      { text: 'Bash', value: 'bash' }
    ]
  };

  ngOnInit(): void {
    this.loadArticle();
  }

  loadArticle(): void {
    this.loading = true;
    this.http.get<ArticleContent>(`/api/admin/articles/lesson/${this.lessonId}`).subscribe({
      next: (article) => {
        this.articleContent = article.content;
        this.articleId = article.id || null;
        this.loading = false;
      },
      error: (err) => {
        // Article doesn't exist yet (404 is expected for new articles)
        if (err.status === 404) {
          this.articleContent = '';
          this.articleId = null;
        } else {
          console.error('Error loading article:', err);
        }
        this.loading = false;
      }
    });
  }

  saveArticle(): void {
    if (!this.articleContent || this.articleContent.trim().length === 0) {
      alert('Article content cannot be empty');
      return;
    }

    this.saving = true;

    if (this.articleId) {
      // Update existing article
      this.http.put(`/api/admin/articles/${this.articleId}`, {
        content: this.articleContent
      }).subscribe({
        next: () => {
          this.saving = false;
          this.saved.emit();
        },
        error: (err) => {
          console.error('Error updating article:', err);
          alert('Failed to save article');
          this.saving = false;
        }
      });
    } else {
      // Create new article
      this.http.post('/api/admin/articles', {
        lessonId: this.lessonId,
        content: this.articleContent
      }).subscribe({
        next: (response: any) => {
          this.articleId = response.id;
          this.saving = false;
          this.saved.emit();
        },
        error: (err) => {
          console.error('Error creating article:', err);
          alert('Failed to save article');
          this.saving = false;
        }
      });
    }
  }

  cancel(): void {
    this.cancelled.emit();
  }
}

