import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-upcoming-card',
  standalone: true,
  template: `
    <div class="upcoming-card">
      <div class="upcoming-card__image"></div>
      <div class="upcoming-card__content">
        <h3 class="upcoming-card__title">{{ title }}</h3>
        <p class="upcoming-card__instructor">{{ instructor }}</p>
        <div class="upcoming-card__meta">
          <span>📅 Starts: {{ start }}</span>
          <span>⏱️ Duration: {{ duration }}</span>
        </div>
        <div class="upcoming-card__footer">
          <div>
            <div class="upcoming-card__price">{{ price }}</div>
            <div class="upcoming-card__spots">{{ spots }}</div>
          </div>
          <button class="btn-upcoming-enroll">View Details & Enroll</button>
        </div>
      </div>
    </div>
  `
})
export class UpcomingCardComponent {
  @Input() title = '';
  @Input() instructor = '';
  @Input() start = '';
  @Input() duration = '';
  @Input() price = '';
  @Input() spots = '';
}


