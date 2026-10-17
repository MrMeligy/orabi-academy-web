import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { describeError } from '../interceptors/http-error.interceptor';
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
import {
  AcademyService,
  AttendencesService,
  CoachesService,
  CoursesService,
  FeedbacksService,
  ParentsService,
  RegistrationsService,
  SessionsService,
  StudentsService,
} from './entity-resources';
import { CrudResource } from './rest-resource';

export type EntityKey =
  | 'academy'
  | 'coaches'
  | 'parents'
  | 'students'
  | 'courses'
  | 'sessions'
  | 'registrations'
  | 'attendences'
  | 'feedbacks';

export interface AcademyData {
  academy: Academy[];
  coaches: Coach[];
  parents: Parent[];
  students: Student[];
  courses: Course[];
  sessions: Session[];
  registrations: Registration[];
  attendences: Attendence[];
  feedbacks: Feedback[];
}

const EMPTY: AcademyData = {
  academy: [],
  coaches: [],
  parents: [],
  students: [],
  courses: [],
  sessions: [],
  registrations: [],
  attendences: [],
  feedbacks: [],
};

/**
 * مخزن مشترك يحمّل كل بيانات الأكاديمية مرة واحدة ويعيد استخدامها في
 * لوحة المعلومات والقوائم المنسدلة، مع إمكانية تحديث كيان واحد بعد أي عملية.
 */
@Injectable({ providedIn: 'root' })
export class AcademyStore {
  private readonly academySvc = inject(AcademyService);
  private readonly coachesSvc = inject(CoachesService);
  private readonly parentsSvc = inject(ParentsService);
  private readonly studentsSvc = inject(StudentsService);
  private readonly coursesSvc = inject(CoursesService);
  private readonly sessionsSvc = inject(SessionsService);
  private readonly registrationsSvc = inject(RegistrationsService);
  private readonly attendencesSvc = inject(AttendencesService);
  private readonly feedbacksSvc = inject(FeedbacksService);

  readonly data = signal<AcademyData>({ ...EMPTY });
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly lastUpdated = signal<Date | null>(null);

  readonly counts = computed(() => {
    const d = this.data();
    return {
      academy: d.academy.length,
      coaches: d.coaches.length,
      parents: d.parents.length,
      students: d.students.length,
      courses: d.courses.length,
      sessions: d.sessions.length,
      registrations: d.registrations.length,
      attendences: d.attendences.length,
      feedbacks: d.feedbacks.length,
    };
  });

  private readonly sources: Record<EntityKey, CrudResource<{ id: number }>> = {
    academy: this.academySvc,
    coaches: this.coachesSvc,
    parents: this.parentsSvc,
    students: this.studentsSvc,
    courses: this.coursesSvc,
    sessions: this.sessionsSvc,
    registrations: this.registrationsSvc,
    attendences: this.attendencesSvc,
    feedbacks: this.feedbacksSvc,
  };

  constructor() {
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    forkJoin({
      academy: this.academySvc.list(),
      coaches: this.coachesSvc.list(),
      parents: this.parentsSvc.list(),
      students: this.studentsSvc.list(),
      courses: this.coursesSvc.list(),
      sessions: this.sessionsSvc.list(),
      registrations: this.registrationsSvc.list(),
      attendences: this.attendencesSvc.list(),
      feedbacks: this.feedbacksSvc.list(),
    }).subscribe({
      next: (result) => {
        this.data.set(result as AcademyData);
        this.error.set(null);
        this.loading.set(false);
        this.lastUpdated.set(new Date());
      },
      error: (err: unknown) => {
        this.error.set(describeError(err).detail);
        this.loading.set(false);
      },
    });
  }

  /** إعادة تحميل كيان واحد فقط بعد إضافة/تعديل/حذف */
  reload(key: EntityKey): void {
    this.sources[key].list().subscribe({
      next: (list) => {
        this.data.update((current) => ({ ...current, [key]: list } as AcademyData));
        this.lastUpdated.set(new Date());
      },
      error: () => {
        /* يتم تجاهل الخطأ هنا لأن الصفحة الحالية تعرض رسائلها بنفسها */
      },
    });
  }

  /* ============ قوائم مساعدة للعرض ============ */

  readonly studentName = computed(() => {
    const map = new Map<number, string>();
    for (const s of this.data().students) map.set(s.id, s.name);
    return map;
  });

  readonly parentById = computed(() => {
    const map = new Map<number, Parent>();
    for (const p of this.data().parents) map.set(p.id, p);
    return map;
  });

  readonly coachById = computed(() => {
    const map = new Map<number, Coach>();
    for (const c of this.data().coaches) map.set(c.id, c);
    return map;
  });

  readonly courseById = computed(() => {
    const map = new Map<number, Course>();
    for (const c of this.data().courses) map.set(c.id, c);
    return map;
  });

  readonly sessionById = computed(() => {
    const map = new Map<number, Session>();
    for (const s of this.data().sessions) map.set(s.id, s);
    return map;
  });

  readonly studentById = computed(() => {
    const map = new Map<number, Student>();
    for (const s of this.data().students) map.set(s.id, s);
    return map;
  });

  /** خيارات جاهزة للحقول المنسدلة */
  readonly studentOptions = computed(() =>
    [...this.data().students]
      .sort((a, b) => a.name.localeCompare(b.name, 'ar'))
      .map((s) => ({ value: s.id, label: `#${s.id} — ${s.name}` })),
  );

  readonly parentOptions = computed(() =>
    [...this.data().parents]
      .sort((a, b) => a.name.localeCompare(b.name, 'ar'))
      .map((p) => ({ value: p.id, label: `#${p.id} — ${p.name}` })),
  );

  readonly coachOptions = computed(() =>
    [...this.data().coaches]
      .sort((a, b) => a.name.localeCompare(b.name, 'ar'))
      .map((c) => ({ value: c.id, label: `#${c.id} — ${c.name}` })),
  );

  readonly courseOptions = computed(() =>
    [...this.data().courses]
      .sort((a, b) => a.name.localeCompare(b.name, 'ar'))
      .map((c) => ({ value: c.id, label: `#${c.id} — ${c.name} (مستوى ${c.level})` })),
  );

  readonly sessionOptions = computed(() =>
    [...this.data().sessions]
      .sort((a, b) => b.dateTime - a.dateTime)
      .map((s) => ({
        value: s.id,
        label: `#${s.id} — حصة الكورس «${this.courseById().get(s.courseID)?.name ?? s.courseID}»`,
      })),
  );

  /** الكورس الذي يدرّبه مدرب معيّن */
  coursesOfCoach(coachId: number): Course[] {
    return this.data().courses.filter((c) => c.coachID === coachId);
  }

  /** الحصص الخاصة بكورس */
  sessionsOfCourse(courseId: number): Session[] {
    return this.data().sessions.filter((s) => s.courseID === courseId);
  }

  /** الطلاب المسجلون في كورس */
  studentsOfCourse(courseId: number): Student[] {
    const ids = new Set(
      this.data()
        .registrations.filter((r) => r.courseId === courseId)
        .map((r) => r.studentId),
    );
    return this.data().students.filter((s) => ids.has(s.id));
  }

  /** الكورسات التي سجّل فيها طالب */
  coursesOfStudent(studentId: number): Course[] {
    const ids = new Set(
      this.data()
        .registrations.filter((r) => r.studentId === studentId)
        .map((r) => r.courseId),
    );
    return this.data().courses.filter((c) => ids.has(c.id));
  }

  /** عدد مرات حضور طالب */
  attendanceOfStudent(studentId: number): number {
    return this.data().attendences.filter((a) => a.studentId === studentId).length;
  }

  /** أبناء ولي الأمر */
  childrenOfParent(parentId: number): Student[] {
    return this.data().students.filter((s) => s.parentId === parentId);
  }

  /** تقييمات طالب */
  feedbacksOfStudent(studentId: number): Feedback[] {
    return this.data().feedbacks.filter((f) => f.studentID === studentId);
  }
}
