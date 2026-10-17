import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { StudentsService } from '../../core/services/entity-resources';
import { AcademyStore } from '../../core/services/academy-store';
import { formatNumber, tintFor } from '../../core/util/format';
import { CrudPage } from '../../shared/crud/crud-page';
import { CrudConfig, DetailItem, FormField, Row, TableColumn } from '../../shared/crud/types';

/** إدارة الطلاب: عرض، بحث، إضافة، تعديل، حذف، وتفاصيل كاملة */
@Component({
  selector: 'app-students-page',
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
export class StudentsPage {
  private readonly store = inject(AcademyStore);
  readonly resource = inject(StudentsService);
  readonly searchKeys = ['name', 'phone', 'address'];

  readonly config: CrudConfig = {
    title: 'الطلاب',
    subtitle: 'إدارة بيانات الطلاب وربطهم بأولياء الأمور والكورسات',
    icon: 'students',
    accent: 'bg-blue',
    entityLabel: 'طالب',
    entityPlural: 'الطلاب',
    addLabel: 'إضافة طالب',
    searchPlaceholder: 'ابحث بالاسم أو الهاتف أو العنوان...',
    emptyTitle: 'لا يوجد طلاب مسجلون بعد',
    emptyText: 'ابدأ بإضافة أول طالب في الأكاديمية وربطه بولي أمره.',
    exportName: 'students',
  };

  readonly columns = computed<TableColumn[]>(() => {
    const parents = this.store.parentById();
    return [
      { key: 'id', label: '#', cell: 'id', width: '76px' },
      {
        key: 'name',
        label: 'اسم الطالب',
        cell: 'primary',
        avatar: (row) => tintFor(row.name),
        sub: (row) => {
          const parent = parents.get(row.parentId);
          return parent ? `ولي الأمر: ${parent.name}` : 'بدون ولي أمر';
        },
      },
      { key: 'phone', label: 'الهاتف', cell: 'mono', width: '150px' },
      { key: 'address', label: 'العنوان' },
      {
        key: 'coursesCount',
        label: 'الكورسات',
        align: 'center',
        width: '120px',
        cell: 'badge',
        value: (row) => this.store.coursesOfStudent(row.id).length,
        badge: (row) => (this.store.coursesOfStudent(row.id).length > 0 ? 'badge-green' : 'badge-gray'),
        format: (row) => `${formatNumber(this.store.coursesOfStudent(row.id).length)} كورس`,
      },
      {
        key: 'attendanceCount',
        label: 'مرات الحضور',
        align: 'center',
        width: '130px',
        value: (row) => this.store.attendanceOfStudent(row.id),
        format: (row) => `${formatNumber(this.store.attendanceOfStudent(row.id))} مرة`,
      },
    ];
  });

  readonly fields = computed<FormField[]>(() => [
    {
      key: 'name',
      label: 'اسم الطالب',
      kind: 'text',
      required: true,
      placeholder: 'مثال: أحمد محمد علي',
    },
    {
      key: 'phone',
      label: 'رقم الهاتف',
      kind: 'tel',
      placeholder: '01xxxxxxxxx',
      hint: 'يُقبل الرقم مع الرموز + - ( )',
    },
    {
      key: 'parentId',
      label: 'ولي الأمر',
      kind: 'select',
      required: true,
      options: this.store.parentOptions(),
      placeholder: '— اختر ولي الأمر —',
      hint: 'أضف ولي الأمر أولاً من صفحة أولياء الأمور',
    },
    {
      key: 'address',
      label: 'العنوان',
      kind: 'text',
      span2: true,
      placeholder: 'المدينة - الشارع - رقم المبنى',
    },
  ]);

  readonly detail = (row: Row): DetailItem[] => {
    const parent = this.store.parentById().get(row.parentId);
    const courses = this.store.coursesOfStudent(row.id);
    const feedbacks = this.store.feedbacksOfStudent(row.id);
    return [
      { label: 'رقم الطالب', value: `#${row.id}` },
      { label: 'الاسم', value: row.name || '—' },
      { label: 'الهاتف', value: row.phone || '—' },
      { label: 'العنوان', value: row.address || '—' },
      { label: 'ولي الأمر', value: parent ? `${parent.name} — ${parent.phone}` : 'غير مرتبط', wide: true },
      {
        label: 'الكورسات المسجَّل بها',
        value: courses.length ? courses.map((c) => `${c.name} (مستوى ${c.level})`).join(' • ') : 'لا يوجد',
        wide: true,
      },
      { label: 'عدد مرات الحضور', value: formatNumber(this.store.attendanceOfStudent(row.id)) },
      { label: 'عدد التقييمات', value: formatNumber(feedbacks.length) },
      {
        label: 'آخر تقييم',
        value: feedbacks.length ? feedbacks[feedbacks.length - 1].content : 'لا يوجد',
        wide: true,
      },
    ];
  };

  onChanged(): void {
    this.store.reload('students');
  }
}
