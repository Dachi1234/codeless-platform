import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CoursesComponent } from './pages/courses/courses.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { CourseDetailComponent } from './pages/course-detail/course-detail.component';
import { CourseLearnComponent } from './pages/course-learn/course-learn.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { MyCoursesComponent } from './pages/my-courses/my-courses.component';
import { CartComponent } from './pages/cart/cart.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MyOrdersComponent } from './pages/my-orders/my-orders.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { AdminLayoutComponent } from './pages/admin/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';
import { AdminCoursesComponent } from './pages/admin/admin-courses/admin-courses.component';
import { CourseEditorComponent } from './pages/admin/course-editor/course-editor.component';
import { CurriculumEditorComponent } from './pages/admin/curriculum-editor/curriculum-editor.component';
import { AdminUsersComponent } from './pages/admin/admin-users/admin-users.component';
import { AdminOrdersComponent } from './pages/admin/admin-orders/admin-orders.component';
import { AdminEnrollmentsComponent } from './pages/admin/admin-enrollments/admin-enrollments.component';
import { AdminAnalyticsComponent } from './pages/admin/admin-analytics/admin-analytics.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: HomeComponent },
  { path: 'courses', component: CoursesComponent },
  { path: 'courses/:id', component: CourseDetailComponent },
  { path: 'courses/:id/learn', component: CourseLearnComponent, canActivate: [authGuard] },
  { path: 'cart', component: CartComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'my-orders', component: MyOrdersComponent, canActivate: [authGuard] },
  { path: 'my-courses', component: MyCoursesComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'courses', component: AdminCoursesComponent },
      { path: 'courses/create', component: CourseEditorComponent },
      { path: 'courses/:id/edit', component: CourseEditorComponent },
      { path: 'courses/:id/curriculum', component: CurriculumEditorComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'enrollments', component: AdminEnrollmentsComponent },
      { path: 'analytics', component: AdminAnalyticsComponent }
    ]
  },
  { path: '**', redirectTo: 'home' }
];
