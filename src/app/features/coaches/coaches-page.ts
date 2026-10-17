import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CoachesService } from '../../core/services/entity-resources';
import { AcademyStore } from '../../core/services/academy-store';
import { formatDate, formatNumber, tintFor } from '../../core/util/format';
import { CrudPage } from '../../shared/crud/crud-page';
import { CrudConfig, DetailItem, FormField, Row, TableColumn } from '../../shared/crud/types';

/** إدارة المدربين والكورسات المرتبطة بهم */
@Component({
  selector: 'app-coaches-page',
  imports: [CrudPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-crud-page
    [resource]="resource"
    [config]="config"
    [columns]="columns()"
    [fields]="fields"
    [searchKeys]="searchKeys"
    [detail]="detail"
    (dataChanged)="onChanged()"
  />`,
})
export class CoachesPage {
  private readonly store = inject(AcademyStore);
  readonly resource = inject(CoachesService);
  readonly searchKeys = ['name', 'phone'];

  readonly config: CrudConfig = {
    title: 'المدربون',
    subtitle: 'فريق التدريب المسؤول عن الكورسات والحصص',
    icon: 'coaches',
    accent: 'bg-blue',
    entityLabel: 'مدرب',
    entityPlural: 'المدربون',
    addLabel: 'إضافة مدرب',
    searchPlaceholder: 'ابحث بالاسم أو رقم الهاتف...',
    emptyTitle: 'لا يوجد مدربون بعد',
    emptyText: 'أضف المدربين لتتمكن من إسناد الكورسات إليهم.',
    exportName: 'coaches',
  };

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'id', label: '#', cell: 'id', width: '76px' },
    {
      key: 'name',
      label: 'اسم المدرب',
      cell: 'primary',
      avatar: (row) => tintFor(row.name),
      sub: (row) => `تاريخ الميلاد: ${formatDate(row.dateOfBirth, 'short')}`,
    },
    { key: 'phone', label: 'الهاتف', cell: 'mono', width: '160px' },
    { key: 'dateOfBirth', label: 'تاريخ الميلاد', width: '170px' },
    {
      key: 'coursesCount',
      label: 'عدد الكورسات',
      align: 'center',
      width: '140px',
      cell: 'badge',
      value: (row) => this.store.coursesOfCoach(row.id).length,
      badge: (row) => (this.store.coursesOfCoach(row.id).length > 0 ? 'badge-blue' : 'badge-gray'),
      format: (row) => `${formatNumber(this.store.coursesOfCoach(row.id).length)} كورس`,
    },
  ]);

  readonly fields: FormField[] = [
    { key: 'name', label: 'اسم المدرب', kind: 'text', required: true, placeholder: 'مثال: كابتن محمود سامي' },
    { key: 'phone', label: 'رقم الهاتف', kind: 'tel', required: true, placeholder: '01xxxxxxxxx' },
    {
      key: 'dateOfBirth',
      label: 'تاريخ الميلاد',
      kind: 'date',
      required: true,
      hint: 'أرسل بصيغة yyyy-MM-dd كما يتوقعها النظام',
    },
  ];

  readonly detail = (row: Row): DetailItem[] => {
    const courses = this.store.coursesOfCoach(row.id);
    const sessions = courses.reduce((total, course) => total + this.store.sessionsOfCourse(course.id).length, 0);
    const students = new Set<number>();
    for (const course of courses) {
      for (const student of this.store.studentsOfCourse(course.id)) students.add(student.id);
    }
    return [
      { label: 'رقم المدرب', value: `#${row.id}` },
      { label: 'الاسم', value: row.name || '—' },
      { label: 'الهاتف', value: row.phone || '—' },
      { label: 'تاريخ الميلاد', value: formatDate(row.dateOfBirth) },
      {
        label: 'الكورسات المُسندة',
        value: courses.length ? courses.map((c) => `${c.name} (${c.day})`).join(' • ') : 'لا يوجد',
        wide: true,
      },
      { label: 'عدد الحصص', value: formatNumber(sessions) },
      { label: 'عدد الطلاب', value: formatNumber(students.size) },
    ];
  };

  onChanged(): void {
    this.store.reload('coaches');
  }
}
