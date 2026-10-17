import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AcademyStore } from '../../core/services/academy-store';
import { NAV_ITEMS, NavItem } from '../../layout/navigation';
import { formatNumber, formatSessionDateTime, tintFor } from '../../core/util/format';
import { Icon, IconName } from '../../shared/ui/icon';

interface BarItem {
  label: string;
  value: number;
}

interface StatCard {
  label: string;
  value: number;
  icon: IconName;
  hint: string;
  path: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, Icon],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  readonly store = inject(AcademyStore);

  readonly today = new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  /** بطاقات الإحصائيات — نمط بصري موحّد لكل البطاقات */
  readonly stats = computed<StatCard[]>(() => {
    const c = this.store.counts();
    return [
      { label: 'الطلاب', value: c.students, icon: 'students', hint: 'طالب مسجل في الأكاديمية', path: '/students' },
      { label: 'أولياء الأمور', value: c.parents, icon: 'parents', hint: 'ولي أمر مسجل', path: '/parents' },
      { label: 'المدربون', value: c.coaches, icon: 'coaches', hint: 'مدرب ضمن الفريق', path: '/coaches' },
      { label: 'الكورسات', value: c.courses, icon: 'courses', hint: 'كورس متاح حالياً', path: '/courses' },
      { label: 'الحصص', value: c.sessions, icon: 'sessions', hint: 'حصة مجدولة', path: '/sessions' },
      { label: 'التسجيلات', value: c.registrations, icon: 'registrations', hint: 'عملية تسجيل في كورس', path: '/registrations' },
      { label: 'سجلات الحضور', value: c.attendences, icon: 'attendances', hint: 'حضور مسجَّل للطلاب', path: '/attendances' },
      { label: 'التقييمات', value: c.feedbacks, icon: 'feedbacks', hint: 'ملاحظة وتقييم', path: '/feedbacks' },
    ];
  });

  readonly quickLinks = computed<NavItem[]>(() => NAV_ITEMS.filter((item) => item.path !== '/dashboard'));

  /** أكثر الكورسات تسجيلاً */
  readonly topCourses = computed<BarItem[]>(() => {
    const { registrations, courses } = this.store.data();
    const counts = new Map<number, number>();
    for (const reg of registrations) counts.set(reg.courseId, (counts.get(reg.courseId) ?? 0) + 1);
    return this.toBars(
      [...counts.entries()].map(([courseId, value]) => ({
        label: courses.find((c) => c.id === courseId)?.name ?? `كورس #${courseId}`,
        value,
      })),
    );
  });

  /** الحضور حسب الكورس (عبر الحصص) */
  readonly attendanceByCourse = computed<BarItem[]>(() => {
    const { attendences, sessions, courses } = this.store.data();
    const counts = new Map<number, number>();
    for (const att of attendences) {
      const session = sessions.find((s) => s.id === att.sessionId);
      if (!session) continue;
      counts.set(session.courseID, (counts.get(session.courseID) ?? 0) + 1);
    }
    return this.toBars(
      [...counts.entries()].map(([courseId, value]) => ({
        label: courses.find((c) => c.id === courseId)?.name ?? `كورس #${courseId}`,
        value,
      })),
    );
  });

  /** عدد الكورسات لكل مدرب */
  readonly coursesByCoach = computed<BarItem[]>(() => {
    const { courses, coaches } = this.store.data();
    const counts = new Map<number, number>();
    for (const course of courses) counts.set(course.coachID, (counts.get(course.coachID) ?? 0) + 1);
    return this.toBars(
      [...counts.entries()].map(([coachId, value]) => ({
        label: coaches.find((c) => c.id === coachId)?.name ?? `مدرب #${coachId}`,
        value,
      })),
    );
  });

  readonly recentRegistrations = computed(() =>
    [...this.store.data().registrations]
      .sort((a, b) => b.id - a.id)
      .slice(0, 6)
      .map((reg) => ({
        id: reg.id,
        student: this.store.studentById().get(reg.studentId)?.name ?? `طالب #${reg.studentId}`,
        course: this.store.courseById().get(reg.courseId)?.name ?? `كورس #${reg.courseId}`,
      })),
  );

  readonly recentFeedbacks = computed(() =>
    [...this.store.data().feedbacks]
      .sort((a, b) => b.id - a.id)
      .slice(0, 5)
      .map((fb) => ({
        id: fb.id,
        content: fb.content,
        student: this.store.studentById().get(fb.studentID)?.name ?? `طالب #${fb.studentID}`,
        course: this.store.courseById().get(fb.courseID)?.name ?? `كورس #${fb.courseID}`,
      })),
  );

  readonly nextSessions = computed(() =>
    [...this.store.data().sessions]
      .sort((a, b) => a.dateTime - b.dateTime)
      .slice(0, 5)
      .map((s) => ({
        id: s.id,
        when: formatSessionDateTime(s.dateTime),
        course: this.store.courseById().get(s.courseID)?.name ?? `كورس #${s.courseID}`,
        coach: this.store.coachById().get(this.store.courseById().get(s.courseID)?.coachID ?? -1)?.name ?? '—',
      })),
  );

  readonly unregisteredStudents = computed(() => {
    const registered = new Set(this.store.data().registrations.map((r) => r.studentId));
    return this.store.data().students.filter((s) => !registered.has(s.id)).length;
  });

  readonly averageStudentsPerCourse = computed(() => {
    const courses = this.store.counts().courses;
    if (courses === 0) return 0;
    return Math.round((this.store.counts().registrations / courses) * 10) / 10;
  });

  /** صفّ لون هادئ للأفاتار انطلاقاً من الاسم */
  tint(seed: string | number): string {
    return tintFor(seed);
  }

  number(value: number): string {
    return formatNumber(value);
  }

  private toBars(items: { label: string; value: number }[], limit = 6): BarItem[] {
    return items
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, limit)
      .map((item) => ({ label: item.label, value: item.value }));
  }

  barWidth(value: number, items: BarItem[]): string {
    const max = Math.max(...items.map((i) => i.value), 1);
    return `${Math.max(6, Math.round((value / max) * 100))}%`;
  }
}
