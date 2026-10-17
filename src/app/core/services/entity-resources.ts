import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../config/api.config';
import type {
  Academy,
  Attendence,
  Coach,
  Course,
  Feedback,
  Parent,
  Registration,
  Session,
  Student,
} from '../models';
import { RestResource } from './rest-resource';

/**
 * خدمات الوصول إلى بيانات النظام الخلفي.
 * كل خدمة تُطابق Controller واحداً في الواجهة الخلفية.
 */

@Injectable({ providedIn: 'root' })
export class AcademyService extends RestResource<Academy> {
  constructor() {
    super(inject(HttpClient), API_BASE_URL, 'Academies');
  }
}

@Injectable({ providedIn: 'root' })
export class CoachesService extends RestResource<Coach> {
  constructor() {
    super(inject(HttpClient), API_BASE_URL, 'Coaches');
  }
}

@Injectable({ providedIn: 'root' })
export class ParentsService extends RestResource<Parent> {
  constructor() {
    super(inject(HttpClient), API_BASE_URL, 'Parents');
  }
}

@Injectable({ providedIn: 'root' })
export class StudentsService extends RestResource<Student> {
  constructor() {
    super(inject(HttpClient), API_BASE_URL, 'Students');
  }
}

@Injectable({ providedIn: 'root' })
export class CoursesService extends RestResource<Course> {
  constructor() {
    super(inject(HttpClient), API_BASE_URL, 'Courses');
  }
}

@Injectable({ providedIn: 'root' })
export class SessionsService extends RestResource<Session> {
  constructor() {
    super(inject(HttpClient), API_BASE_URL, 'Sessions');
  }
}

@Injectable({ providedIn: 'root' })
export class RegistrationsService extends RestResource<Registration> {
  constructor() {
    super(inject(HttpClient), API_BASE_URL, 'Registrations');
  }
}

@Injectable({ providedIn: 'root' })
export class AttendencesService extends RestResource<Attendence> {
  constructor() {
    super(inject(HttpClient), API_BASE_URL, 'Attendences');
  }
}

@Injectable({ providedIn: 'root' })
export class FeedbacksService extends RestResource<Feedback> {
  constructor() {
    super(inject(HttpClient), API_BASE_URL, 'Feedbacks');
  }
}
