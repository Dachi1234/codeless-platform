import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as PlyrNamespace from 'plyr';

type Plyr = PlyrNamespace.default;

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="video-player-wrapper">
      <div #playerElement class="plyr-container">
        <div [id]="playerId"></div>
      </div>
    </div>
  `,
  styles: [`
    .video-player-wrapper {
      width: 100%;
      aspect-ratio: 16/9;
      background: #000;
      border-radius: 8px;
      overflow: hidden;
    }

    .plyr-container {
      width: 100%;
      height: 100%;
    }

    .player-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 40px;
      background: #1F2937;
      color: #F3F4F6;
      text-align: center;
    }

    .player-error p {
      margin: 8px 0;
      font-size: 14px;
    }

    .player-error p:first-child {
      font-weight: 600;
      color: #EF4444;
      font-size: 16px;
    }
  `]
})
export class VideoPlayerComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() videoUrl: string = '';
  @Input() lessonId: number | null = null;
  @Input() lastPosition: number = 0; // In seconds
  @Output() timeUpdate = new EventEmitter<number>();
  @Output() videoEnded = new EventEmitter<void>();
  @Output() progressUpdate = new EventEmitter<{ position: number; timeSpent: number }>();

  @ViewChild('playerElement', { static: false }) playerElement!: ElementRef;

  playerId = `player-${Math.random().toString(36).substr(2, 9)}`;
  player: Plyr | null = null;
  startTime = 0;
  lastSavedPosition = 0;
  private initialized = false;

  ngOnInit(): void {
    this.startTime = Date.now();
  }

  ngAfterViewInit(): void {
    this.initializePlayer();
    this.initialized = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reinitialize player when videoUrl or lessonId changes (but only after initial setup)
    if (this.initialized && (changes['videoUrl'] || changes['lessonId'])) {
      console.log('[VideoPlayer] Detected input change, reinitializing player');
      console.log('[VideoPlayer] New videoUrl:', this.videoUrl);
      console.log('[VideoPlayer] New lessonId:', this.lessonId);
      
      // Destroy existing player
      this.destroyPlayer();
      
      // Reinitialize with new video
      setTimeout(() => {
        this.initializePlayer();
      }, 100);
    }
  }

  initializePlayer(): void {
    if (!this.videoUrl) {
      console.warn('No video URL provided');
      return;
    }

    console.log('[VideoPlayer] Initializing with URL:', this.videoUrl);

    const playerContainer = document.getElementById(this.playerId);
    if (!playerContainer) {
      console.error('Player container not found');
      return;
    }

    // Determine video type (YouTube, Vimeo, or direct)
    const videoType = this.getVideoType(this.videoUrl);
    console.log('[VideoPlayer] Video type detected:', videoType);

    let targetElement: HTMLElement | null = null;

    if (videoType === 'youtube') {
      // YouTube embed
      const videoId = this.extractYouTubeId(this.videoUrl);
      console.log('[VideoPlayer] YouTube video ID:', videoId);
      
      if (!videoId) {
        console.error('[VideoPlayer] Failed to extract YouTube video ID from:', this.videoUrl);
        playerContainer.innerHTML = `
          <div class="player-error">
            <p>Invalid YouTube URL. Please use format:</p>
            <p>https://youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID</p>
          </div>
        `;
        return;
      }
      
      playerContainer.innerHTML = `
        <div data-plyr-provider="youtube" data-plyr-embed-id="${videoId}"></div>
      `;
      targetElement = playerContainer.querySelector('div[data-plyr-provider]');
    } else if (videoType === 'vimeo') {
      // Vimeo embed
      const videoId = this.extractVimeoId(this.videoUrl);
      console.log('[VideoPlayer] Vimeo video ID:', videoId);
      
      if (!videoId) {
        console.error('[VideoPlayer] Failed to extract Vimeo video ID from:', this.videoUrl);
        return;
      }
      
      playerContainer.innerHTML = `
        <div data-plyr-provider="vimeo" data-plyr-embed-id="${videoId}"></div>
      `;
      targetElement = playerContainer.querySelector('div[data-plyr-provider]');
    } else {
      // Direct video file
      console.log('[VideoPlayer] Loading direct video file');
      playerContainer.innerHTML = `
        <video controls crossorigin playsinline>
          <source src="${this.videoUrl}" type="video/mp4">
        </video>
      `;
      targetElement = playerContainer.querySelector('video');
    }

    if (!targetElement) {
      console.error('[VideoPlayer] Target element not found after creating HTML');
      return;
    }

    // Initialize Plyr
    console.log('[VideoPlayer] Initializing Plyr on element:', targetElement);
    console.log('[VideoPlayer] Container HTML:', playerContainer.innerHTML);
    
    try {
      this.player = new PlyrNamespace.default(targetElement, {
        controls: [
          'play-large',
          'play',
          'progress',
          'current-time',
          'mute',
          'volume',
          'settings',
          'pip',
          'airplay',
          'fullscreen'
        ],
        settings: ['speed', 'quality'],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
        quality: { default: 720, options: [1080, 720, 480, 360] },
        youtube: {
          noCookie: false,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          modestbranding: 1
        }
      });

      console.log('[VideoPlayer] Plyr instance created:', this.player);
    } catch (error) {
      console.error('[VideoPlayer] Error initializing Plyr:', error);
      return;
    }

    // Event listeners
    this.player.on('ready', () => {
      console.log('[VideoPlayer] Plyr ready event fired');
      // Resume from last position if available
      if (this.lastPosition > 0 && this.player) {
        this.player.currentTime = this.lastPosition;
      }
    });

    this.player.on('error', (event: any) => {
      console.error('[VideoPlayer] Plyr error event:', event);
    });

    this.player.on('statechange', (event: any) => {
      console.log('[VideoPlayer] Plyr state change:', event);
    });

    this.player.on('timeupdate', () => {
      if (this.player) {
        const currentTime = Math.floor(this.player.currentTime);
        this.timeUpdate.emit(currentTime);

        // Save progress every 10 seconds
        if (currentTime > 0 && currentTime % 10 === 0 && currentTime !== this.lastSavedPosition) {
          this.lastSavedPosition = currentTime;
          const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
          this.progressUpdate.emit({
            position: currentTime,
            timeSpent: timeSpent
          });
        }
      }
    });

    this.player.on('ended', () => {
      this.videoEnded.emit();
    });
  }

  getVideoType(url: string): 'youtube' | 'vimeo' | 'direct' {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    } else if (url.includes('vimeo.com')) {
      return 'vimeo';
    }
    return 'direct';
  }

  extractYouTubeId(url: string): string {
    // Handle multiple YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,  // Standard watch and short URL
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,  // Embed URL
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,  // Old embed format
      /youtube\.com\/\?v=([a-zA-Z0-9_-]{11})/,  // Alternative format
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    // Fallback: try to extract any 11-character alphanumeric string
    const fallbackMatch = url.match(/([a-zA-Z0-9_-]{11})/);
    return fallbackMatch ? fallbackMatch[1] : '';
  }

  extractVimeoId(url: string): string {
    const regExp = /vimeo.*\/(\d+)/i;
    const match = url.match(regExp);
    return match ? match[1] : '';
  }

  private destroyPlayer(): void {
    if (this.player) {
      console.log('[VideoPlayer] Destroying existing player');
      try {
        this.player.destroy();
      } catch (error) {
        console.error('[VideoPlayer] Error destroying player:', error);
      }
      this.player = null;
    }
  }

  ngOnDestroy(): void {
    if (this.player) {
      // Save final progress before destroying
      if (this.player.currentTime > 0) {
        const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
        this.progressUpdate.emit({
          position: Math.floor(this.player.currentTime),
          timeSpent: timeSpent
        });
      }
      this.player.destroy();
    }
  }
}

