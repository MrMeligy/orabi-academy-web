import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CoursesService } from '../../core/services/entity-resources';
import { AcademyStore } from '../../core/services/academy-store';
import { ARABIC_DAYS, formatNumber, formatSessionDateTime, tintFor } from '../../core/util/format';
import { CrudPage } from '../../shared/crud/crud-page';
import { CrudConfig, DetailItem, FieldOption, FormField, Row, TableColumn } from '../../shared/crud/types';

/** إدارة الكورسات والمستويات وإسناد المدربين */
@Component({
  selector: 'app-courses-page',
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
export class CoursesPage {
  private readonly store = inject(AcademyStore);
  readonly resource = inject(CoursesService);
  readonly searchKeys = ['name', 'day', 'time'];

  readonly config: CrudConfig = {
    title: 'الكورسات',
    subtitle: 'الكورسات المتاحة، مستوياتها، أيامها، والمدرب المسؤول',
    icon: 'courses',
    accent: 'bg-blue',
    entityLabel: 'كورس',
    entityPlural: 'الكورسات',
    addLabel: 'إضافة كورس',
    searchPlaceholder: 'ابحث باسم الكورس أو اليوم أو الوقت...',
    emptyTitle: 'لا توجد كورسات بعد',
    emptyText: 'أضف الكورسات ثم ابدأ بتسجيل الطلاب فيها.',
    exportName: 'courses',
  };

  /** أيام الأسبوع مع إضافة أي قيم موجودة مسبقاً في البيانات */
  private readonly dayOptions = computed<FieldOption[]>(() => {
    const known = [...ARABIC_DAYS] as string[];
    const existing = new Set(
      this.store
        .data()
        .courses.map((course) => course.day)
        .filter((day): day is string => Boolean(day)),
    );
    const extra = [...existing].filter((day) => !known.includes(day)).sort((a, b) => a.localeCompare(b, 'ar'));
    return [...known, ...extra].map((day) => ({ value: day, label: day }));
  });

  readonly columns = computed<TableColumn[]>(() => {
    const coaches = this.store.coachById();
    return [
      { key: 'id', label: '#', cell: 'id', width: '76px' },
      {
        key: 'name',
        label: 'اسم الكورس',
        cell: 'primary',
        avatar: (row) => tintFor(row.name),
        sub: (row) => `${row.day ?? '—'} • ${row.time ?? '—'}`,
      },
      {
        key: 'level',
        label: 'المستوى',
        align: 'center',
        width: '110px',
        cell: 'badge',
        badge: () => 'badge-blue',
        format: (row) => `مستوى ${formatNumber(row.level)}`,
      },
      { key: 'day', label: 'اليوم', width: '120px' },
      { key: 'time', label: 'الوقت', width: '120px', cell: 'mono' },
      {
        key: 'coach',
        label: 'المدرب',
        value: (row) => coaches.get(row.coachID)?.name ?? '',
        format: (row) => coaches.get(row.coachID)?.name ?? `مدرب #${row.coachID}`,
      },
      {
        key: 'studentsCount',
        label: 'الطلاب',
        align: 'center',
        width: '110px',
        cell: 'badge',
        value: (row) => this.store.studentsOfCourse(row.id).length,
        badge: () => 'badge-blue',
        format: (row) => formatNumber(this.store.studentsOfCourse(row.id).length),
      },
      {
        key: 'sessionsCount',
        label: 'الحصص',
        align: 'center',
        width: '110px',
        value: (row) => this.store.sessionsOfCourse(row.id).length,
        format: (row) => formatNumber(this.store.sessionsOfCourse(row.id).length),
      },
    ];
  });

  readonly fields = computed<FormField[]>(() => [
    { key: 'name', label: 'اسم الكورس', kind: 'text', required: true, placeholder: 'مثال: كرة القدم - براعم' },
    { key: 'level', label: 'المستوى', kind: 'number', required: true, min: 1, placeholder: '1' },
    {
      key: 'coachID',
      label: 'المدرب المسؤول',
      kind: 'select',
      required: true,
      options: this.store.coachOptions(),
      placeholder: '— اختر المدرب —',
      hint: 'أضف المدرب أولاً من صفحة المدربين',
    },
    {
      key: 'day',
      label: 'اليوم',
      kind: 'select',
      required: true,
      options: this.dayOptions(),
      placeholder: '— اختر اليوم —',
    },
    { key: 'time', label: 'الوقت', kind: 'text', required: true, placeholder: 'مثال: 5:00 م' },
  ]);

  readonly detail = (row: Row): DetailItem[] => {
    const sessions = this.store.sessionsOfCourse(row.id);
    const students = this.store.studentsOfCourse(row.id);
    const coach = this.store.coachById().get(row.coachID);
    return [
      { label: 'رقم الكورس', value: `#${row.id}` },
      { label: 'اسم الكورس', value: row.name || '—' },
      { label: 'المستوى', value: formatNumber(row.level) },
      { label: 'اليوم والوقت', value: `${row.day ?? '—'} — ${row.time ?? '—'}` },
      { label: 'المدرب', value: coach ? `${coach.name} — ${coach.phone}` : `مدرب #${row.coachID}`, wide: true },
      {
        label: 'الطلاب المسجَّلون',
        value: students.length ? students.map((s) => s.name).join(' • ') : 'لا يوجد',
        wide: true,
      },
      {
        label: 'الحصص المجدولة',
        value: sessions.length ? sessions.map((s) => formatSessionDateTime(s.dateTime)).join(' • ') : 'لا يوجد',
        wide: true,
      },
    ];
  };

  onChanged(): void {
    this.store.reload('courses');
  }
}
