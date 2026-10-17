import { Routes } from '@angular/router';

/** مسارات النظام — كل صفحة تُحمَّل عند الطلب (lazy loading) */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    title: 'لوحة المعلومات — أكاديمية عرابي',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'students',
    title: 'الطلاب — أكاديمية عرابي',
    loadComponent: () => import('./features/students/students-page').then((m) => m.StudentsPage),
  },
  {
    path: 'parents',
    title: 'أولياء الأمور — أكاديمية عرابي',
    loadComponent: () => import('./features/parents/parents-page').then((m) => m.ParentsPage),
  },
  {
    path: 'coaches',
    title: 'المدربون — أكاديمية عرابي',
    loadComponent: () => import('./features/coaches/coaches-page').then((m) => m.CoachesPage),
  },
  {
    path: 'courses',
    title: 'الكورسات — أكاديمية عرابي',
    loadComponent: () => import('./features/courses/courses-page').then((m) => m.CoursesPage),
  },
  {
    path: 'sessions',
    title: 'الحصص — أكاديمية عرابي',
    loadComponent: () => import('./features/sessions/sessions-page').then((m) => m.SessionsPage),
  },
  {
    path: 'registrations',
    title: 'التسجيلات — أكاديمية عرابي',
    loadComponent: () => import('./features/registrations/registrations-page').then((m) => m.RegistrationsPage),
  },
  {
    path: 'attendances',
    title: 'الحضور — أكاديمية عرابي',
    loadComponent: () => import('./features/attendances/attendances-page').then((m) => m.AttendancesPage),
  },
  {
    path: 'feedbacks',
    title: 'التقييمات — أكاديمية عرابي',
    loadComponent: () => import('./features/feedbacks/feedbacks-page').then((m) => m.FeedbacksPage),
  },
  {
    path: 'academy',
    title: 'بيانات الأكاديمية — أكاديمية عرابي',
    loadComponent: () => import('./features/academy/academy-page').then((m) => m.AcademyPage),
  },
  { path: '**', redirectTo: 'dashboard' },
];
