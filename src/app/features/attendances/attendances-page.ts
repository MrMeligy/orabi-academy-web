import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AttendencesService } from '../../core/services/entity-resources';
import { AcademyStore } from '../../core/services/academy-store';
import { formatNumber, formatSessionDateTime, formatSessionTimeOnly, tintFor } from '../../core/util/format';
import { CrudPage } from '../../shared/crud/crud-page';
import { CrudConfig, DetailItem, FormField, Row, TableColumn } from '../../shared/crud/types';

/** تسجيل حضور الطلاب في الحصص */
@Component({
  selector: 'app-attendances-page',
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
export class AttendancesPage {
  private readonly store = inject(AcademyStore);
  readonly resource = inject(AttendencesService);
  readonly searchKeys = ['studentName', 'courseName', 'sessionLabel'];

  readonly config: CrudConfig = {
    title: 'الحضور',
    subtitle: 'تسجيل حضور الطلاب في حصص الكورسات ومتابعة الانتظام',
    icon: 'attendances',
    accent: 'bg-blue',
    entityLabel: 'سجل حضور',
    entityPlural: 'سجلات الحضور',
    addLabel: 'تسجيل حضور',
    searchPlaceholder: 'ابحث بالطالب أو الكورس أو الحصة...',
    emptyTitle: 'لا توجد سجلات حضور',
    emptyText: 'اختر الطالب والحصة لتسجيل الحضور.',
    exportName: 'attendances',
  };

  readonly columns = computed<TableColumn[]>(() => {
    const students = this.store.studentById();
    const sessions = this.store.sessionById();
    const courses = this.store.courseById();
    const coaches = this.store.coachById();

    const courseOfSession = (sessionId: number) => {
      const session = sessions.get(sessionId);
      return session ? courses.get(session.courseID) : undefined;
    };

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
        key: 'sessionLabel',
        label: 'موعد الحصة',
        value: (row) => sessions.get(row.sessionId)?.dateTime ?? 0,
        format: (row) => {
          const session = sessions.get(row.sessionId);
          return session ? formatSessionDateTime(session.dateTime) : `حصة #${row.sessionId}`;
        },
      },
      {
        key: 'courseName',
        label: 'الكورس',
        cell: 'badge',
        badge: () => 'badge-blue',
        value: (row) => courseOfSession(row.sessionId)?.name ?? '',
        format: (row) => courseOfSession(row.sessionId)?.name ?? '—',
      },
      {
        key: 'coachName',
        label: 'المدرب',
        value: (row) => {
          const course = courseOfSession(row.sessionId);
          return course ? (coaches.get(course.coachID)?.name ?? '') : '';
        },
        format: (row) => {
          const course = courseOfSession(row.sessionId);
          return course ? (coaches.get(course.coachID)?.name ?? '—') : '—';
        },
      },
      {
        key: 'sessionTime',
        label: 'الوقت',
        width: '130px',
        cell: 'mono',
        value: (row) => sessions.get(row.sessionId)?.dateTime ?? 0,
        format: (row) => {
          const session = sessions.get(row.sessionId);
          return session ? formatSessionTimeOnly(session.dateTime) : '—';
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
      key: 'sessionId',
      label: 'الحصة',
      kind: 'select',
      required: true,
      options: this.store.sessionOptions(),
      placeholder: '— اختر الحصة —',
      hint: 'تُعرض الحصص مرتبة من الأحدث إلى الأقدم',
    },
  ]);

  readonly detail = (row: Row): DetailItem[] => {
    const student = this.store.studentById().get(row.studentId);
    const session = this.store.sessionById().get(row.sessionId);
    const course = session ? this.store.courseById().get(session.courseID) : undefined;
    const coach = course ? this.store.coachById().get(course.coachID) : undefined;
    const parent = student ? this.store.parentById().get(student.parentId) : undefined;
    const attendanceCount = this.store.attendanceOfStudent(row.studentId);
    return [
      { label: 'رقم السجل', value: `#${row.id}` },
      { label: 'الطالب', value: student?.name ?? `طالب #${row.studentId}` },
      { label: 'هاتف الطالب', value: student?.phone ?? '—' },
      { label: 'ولي الأمر', value: parent ? `${parent.name} — ${parent.phone}` : '—' },
      { label: 'الحصة', value: session ? formatSessionDateTime(session.dateTime) : `حصة #${row.sessionId}`, wide: true },
      {
        label: 'الكورس',
        value: course ? `${course.name} — مستوى ${course.level}` : '—',
        wide: true,
      },
      { label: 'المدرب', value: coach?.name ?? '—' },
      { label: 'إجمالي حضور الطالب', value: `${formatNumber(attendanceCount)} مرة` },
    ];
  };

  onChanged(): void {
    this.store.reload('attendences');
  }
}
