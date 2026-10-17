import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ParentsService } from '../../core/services/entity-resources';
import { AcademyStore } from '../../core/services/academy-store';
import { formatNumber, tintFor } from '../../core/util/format';
import { CrudPage } from '../../shared/crud/crud-page';
import { CrudConfig, DetailItem, FormField, Row, TableColumn } from '../../shared/crud/types';

/** إدارة أولياء الأمور وربطهم بالطلاب */
@Component({
  selector: 'app-parents-page',
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
export class ParentsPage {
  private readonly store = inject(AcademyStore);
  readonly resource = inject(ParentsService);
  readonly searchKeys = ['name', 'phone', 'address'];

  readonly config: CrudConfig = {
    title: 'أولياء الأمور',
    subtitle: 'بيانات التواصل مع أسر الطلاب ومتابعة أبنائهم',
    icon: 'parents',
    accent: 'bg-slate',
    entityLabel: 'ولي أمر',
    entityPlural: 'أولياء الأمور',
    addLabel: 'إضافة ولي أمر',
    searchPlaceholder: 'ابحث بالاسم أو الهاتف أو العنوان...',
    emptyTitle: 'لا يوجد أولياء أمور بعد',
    emptyText: 'أضف أولياء الأمور لتتمكن من ربطهم بالطلاب.',
    exportName: 'parents',
  };

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'id', label: '#', cell: 'id', width: '76px' },
    {
      key: 'name',
      label: 'اسم ولي الأمر',
      cell: 'primary',
      avatar: (row) => tintFor(row.name),
      sub: (row) => row.address || 'لا يوجد عنوان',
    },
    { key: 'phone', label: 'الهاتف', cell: 'mono', width: '160px' },
    { key: 'address', label: 'العنوان' },
    {
      key: 'childrenCount',
      label: 'عدد الأبناء',
      align: 'center',
      width: '130px',
      cell: 'badge',
      value: (row) => this.store.childrenOfParent(row.id).length,
      badge: (row) => (this.store.childrenOfParent(row.id).length > 0 ? 'badge-blue' : 'badge-gray'),
      format: (row) => `${formatNumber(this.store.childrenOfParent(row.id).length)} طالب`,
    },
  ]);

  readonly fields: FormField[] = [
    { key: 'name', label: 'اسم ولي الأمر', kind: 'text', required: true, placeholder: 'مثال: محمد عبد الرحمن' },
    { key: 'phone', label: 'رقم الهاتف', kind: 'tel', required: true, placeholder: '01xxxxxxxxx' },
    { key: 'address', label: 'العنوان', kind: 'text', span2: true, placeholder: 'المدينة - الشارع' },
  ];

  readonly detail = (row: Row): DetailItem[] => {
    const children = this.store.childrenOfParent(row.id);
    return [
      { label: 'رقم ولي الأمر', value: `#${row.id}` },
      { label: 'الاسم', value: row.name || '—' },
      { label: 'الهاتف', value: row.phone || '—' },
      { label: 'العنوان', value: row.address || '—', wide: true },
      { label: 'عدد الأبناء', value: formatNumber(children.length) },
      {
        label: 'الأبناء المسجَّلون',
        value: children.length
          ? children
              .map((child) => {
                const courses = this.store.coursesOfStudent(child.id);
                return `${child.name}${courses.length ? ` (${courses.map((c) => c.name).join('، ')})` : ''}`;
              })
              .join(' • ')
          : 'لا يوجد',
        wide: true,
      },
    ];
  };

  onChanged(): void {
    this.store.reload('parents');
  }
}
