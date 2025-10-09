import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, CurrencyPipe, NgFor } from '@angular/common';
import { Course, CourseService } from '../../services/course.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { CourseCardComponent } from '../../components/course-card/course-card.component';
import { UpcomingCardComponent } from '../../components/upcoming-card/upcoming-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgFor, AsyncPipe, CourseCardComponent, UpcomingCardComponent],
  template: `
    <!-- Hero Section - Full Width -->
    <section class="hero">
      <div class="hero__shape hero__shape--mint"></div>
      <div class="hero__shape hero__shape--coral"></div>

      <div class="hero__content">
        <div class="brandbar">
          <span class="brandbar__line"></span>
          <span class="brandbar__brace">{{ '{' }} {{ '}' }}</span>
          <span class="brandbar__line"></span>
        </div>
        
        <h1 class="h-hero">CODELESS</h1>

        <p class="lead hero__tagline">
          We keep it fun, we keep it smart. CodeLess offers engaging, insightful courses delivered in a friendly, approachable style.
        </p>

        <a routerLink="/courses" class="hero__cta">
          Buy a course today
        </a>
      </div>
    </section>

    <!-- Stats section -->
    <section class="container stats">
      <div class="stats__grid">
        <div>
          <div class="stats__num">50,000+</div>
          <div class="stats__label">Students Enrolled</div>
        </div>
        <div>
          <div class="stats__num">500+</div>
          <div class="stats__label">Courses Available</div>
        </div>
        <div>
          <div class="stats__num">95%</div>
          <div class="stats__label">Completion Rate</div>
        </div>
      </div>
    </section>

    <!-- Featured courses preview -->
    <section class="featured">
      <div class="container">
        <div class="featured__header">
          <h2 class="h-1">Featured Courses</h2>
          <a routerLink="/courses" class="featured__view">View All Courses</a>
        </div>
        <div class="cards">
          <app-course-card *ngFor="let c of (featured$ | async)" [course]="c"></app-course-card>
        </div>
      </div>
    </section>

    <!-- Upcoming Live Courses -->
    <section class="upcoming">
      <div class="container">
        <div class="upcoming__header">
          <h2 class="h-1">Upcoming Live Courses</h2>
          <a routerLink="/courses" class="upcoming__view">View All Live Courses</a>
        </div>
        <app-upcoming-card 
          title="Digital Marketing Masterclass - LIVE" 
          instructor="David Rodriguez" 
          start="2/15/2024" 
          duration="6 weeks" 
          price="$149" 
          spots="18 spots left">
        </app-upcoming-card>
        <app-upcoming-card 
          title="Live Coding Bootcamp - Full Stack" 
          instructor="Team of Senior Developers" 
          start="3/1/2024" 
          duration="12 weeks" 
          price="$599" 
          spots="7 spots left">
        </app-upcoming-card>
      </div>
    </section>
  `,
  styles: ``
})
export class HomeComponent {
  private readonly service = inject(CourseService);
  featured$: Observable<Course[]> = this.service.list().pipe(
    map(list => list.slice(0, 3))
  );
}
