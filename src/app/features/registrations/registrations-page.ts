import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RegistrationsService } from '../../core/services/entity-resources';
import { AcademyStore } from '../../core/services/academy-store';
import { formatNumber, tintFor } from '../../core/util/format';
import { CrudPage } from '../../shared/crud/crud-page';
import { CrudConfig, DetailItem, FormField, Row, TableColumn } from '../../shared/crud/types';

/** تسجيل الطلاب في الكورسات */
@Component({
  selector: 'app-registrations-page',
  imports: [CrudPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-crud-page
    [resource]="resource"
    [config]="config"
    [columns]="columns()"
    [fields]="fields()"
    [searchKeys]="searchKeys"
    [detail]="detail"
    (dataChanged)="onChanged()"
  />`,
})
export class RegistrationsPage {
  private readonly store = inject(AcademyStore);
  readonly resource = inject(RegistrationsService);
  readonly searchKeys = ['studentName', 'courseName'];

  readonly config: CrudConfig = {
    title: 'التسجيلات',
    subtitle: 'ربط الطلاب بالكورسات المتاحة في الأكاديمية',
    icon: 'registrations',
    accent: 'bg-blue',
    entityLabel: 'تسجيل',
    entityPlural: 'التسجيلات',
    addLabel: 'تسجيل طالب في كورس',
    searchPlaceholder: 'ابحث باسم الطالب أو الكورس...',
    emptyTitle: 'لا توجد تسجيلات بعد',
    emptyText: 'ابدأ بتسجيل الطلاب في الكورسات لظهورهم في قوائم الحضور.',
    exportName: 'registrations',
  };

  readonly columns = computed<TableColumn[]>(() => {
    const students = this.store.studentById();
    const courses = this.store.courseById();
    const coaches = this.store.coachById();
    return [
      { key: 'id', label: '#', cell: 'id', width: '76px' },
      {
        key: 'studentName',
        label: 'الطالب',
        cell: 'primary',
        value: (row) => students.get(row.studentId)?.name ?? '',
        avatar: (row) => tintFor(students.get(row.studentId)?.name ?? row.studentId),
        sub: (row) => students.get(row.studentId)?.phone ?? '—',
        format: (row) => students.get(row.studentId)?.name ?? `طالب #${row.studentId}`,
      },
      {
        key: 'courseName',
        label: 'الكورس',
        cell: 'badge',
        badge: () => 'badge-blue',
        value: (row) => courses.get(row.courseId)?.name ?? '',
        format: (row) => courses.get(row.courseId)?.name ?? `كورس #${row.courseId}`,
      },
      {
        key: 'level',
        label: 'المستوى',
        align: 'center',
        width: '110px',
        value: (row) => courses.get(row.courseId)?.level ?? 0,
        format: (row) => formatNumber(courses.get(row.courseId)?.level ?? 0),
      },
      {
        key: 'coachName',
        label: 'المدرب',
        value: (row) => coaches.get(courses.get(row.courseId)?.coachID ?? -1)?.name ?? '',
        format: (row) => coaches.get(courses.get(row.courseId)?.coachID ?? -1)?.name ?? '—',
      },
      {
        key: 'schedule',
        label: 'الموعد',
        value: (row) => {
          const course = courses.get(row.courseId);
          return course ? `${course.day} ${course.time}` : '';
        },
        format: (row) => {
          const course = courses.get(row.courseId);
          return course ? `${course.day} — ${course.time}` : '—';
        },
      },
    ];
  });

  readonly fields = computed<FormField[]>(() => [
    {
      key: 'studentId',
      label: 'الطالب',
      kind: 'select',
      required: true,
      options: this.store.studentOptions(),
      placeholder: '— اختر الطالب —',
    },
    {
      key: 'courseId',
      label: 'الكورس',
      kind: 'select',
      required: true,
      options: this.store.courseOptions(),
      placeholder: '— اختر الكورس —',
    },
  ]);

  readonly detail = (row: Row): DetailItem[] => {
    const student = this.store.studentById().get(row.studentId);
    const course = this.store.courseById().get(row.courseId);
    const coach = course ? this.store.coachById().get(course.coachID) : undefined;
    const sessions = course ? this.store.sessionsOfCourse(course.id) : [];
    const attendances = this.store
      .data()
      .attendences.filter((a) => a.studentId === row.studentId && sessions.some((s) => s.id === a.sessionId));
    const parent = student ? this.store.parentById().get(student.parentId) : undefined;
    return [
      { label: 'رقم التسجيل', value: `#${row.id}` },
      { label: 'الطالب', value: student?.name ?? `طالب #${row.studentId}` },
      { label: 'هاتف الطالب', value: student?.phone ?? '—' },
      { label: 'ولي الأمر', value: parent ? `${parent.name} — ${parent.phone}` : '—' },
      {
        label: 'الكورس',
        value: course ? `${course.name} — مستوى ${course.level}` : `كورس #${row.courseId}`,
        wide: true,
      },
      { label: 'المدرب', value: coach?.name ?? '—' },
      { label: 'الموعد الأسبوعي', value: course ? `${course.day} — ${course.time}` : '—' },
      { label: 'عدد حصص الكورس', value: formatNumber(sessions.length) },
      { label: 'مرات حضور الطالب في هذا الكورس', value: formatNumber(attendances.length), wide: true },
    ];
  };

  onChanged(): void {
    this.store.reload('registrations');
  }
}
