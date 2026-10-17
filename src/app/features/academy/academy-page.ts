import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AcademyService } from '../../core/services/entity-resources';
import { AcademyStore } from '../../core/services/academy-store';
import { tintFor } from '../../core/util/format';
import { CrudPage } from '../../shared/crud/crud-page';
import { CrudConfig, DetailItem, FormField, Row, TableColumn } from '../../shared/crud/types';

/** بيانات الأكاديمية (الفروع) — الاسم والبريد الإلكتروني والهاتف */
@Component({
  selector: 'app-academy-page',
  imports: [CrudPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-crud-page
    [resource]="resource"
    [config]="config"
    [columns]="columns"
    [fields]="fields"
    [searchKeys]="searchKeys"
    [detail]="detail"
    (dataChanged)="onChanged()"
  />`,
})
export class AcademyPage {
  private readonly store = inject(AcademyStore);
  readonly resource = inject(AcademyService);
  readonly searchKeys = ['name', 'email', 'phone'];

  readonly config: CrudConfig = {
    title: 'بيانات الأكاديمية',
    subtitle: 'بيانات الأكاديمية وفروعها: الاسم، البريد الإلكتروني، ورقم الهاتف',
    icon: 'academy',
    accent: 'bg-slate',
    entityLabel: 'فرع',
    entityPlural: 'الفروع',
    addLabel: 'إضافة فرع',
    searchPlaceholder: 'ابحث بالاسم أو البريد أو الهاتف...',
    emptyTitle: 'لا توجد بيانات للأكاديمية',
    emptyText: 'أضف بيانات الأكاديمية أو فروعها من خلال الزر أدناه.',
    exportName: 'academy',
  };

  readonly columns: TableColumn[] = [
    { key: 'id', label: '#', cell: 'id', width: '76px' },
    {
      key: 'name',
      label: 'اسم الأكاديمية / الفرع',
      cell: 'primary',
      avatar: (row) => tintFor(row.name),
      sub: (row) => row.email || 'لا يوجد بريد إلكتروني',
    },
    { key: 'email', label: 'البريد الإلكتروني', cell: 'mono' },
    { key: 'phone', label: 'رقم الهاتف', cell: 'mono', width: '170px' },
  ];

  readonly fields: FormField[] = [
    { key: 'name', label: 'اسم الأكاديمية / الفرع', kind: 'text', required: true, placeholder: 'مثال: أكاديمية عرابي — الفرع الرئيسي' },
    { key: 'email', label: 'البريد الإلكتروني', kind: 'email', required: true, placeholder: 'info@orabi-academy.com' },
    { key: 'phone', label: 'رقم الهاتف', kind: 'tel', required: true, placeholder: '02xxxxxxxx', span2: true },
  ];

  readonly detail = (row: Row): DetailItem[] => [
    { label: 'الرقم', value: `#${row.id}` },
    { label: 'الاسم', value: row.name || '—' },
    { label: 'البريد الإلكتروني', value: row.email || '—' },
    { label: 'رقم الهاتف', value: row.phone || '—' },
    {
      label: 'إجمالي السجلات في النظام',
      value: `${this.store.counts().students} طالب • ${this.store.counts().coaches} مدرب • ${this.store.counts().courses} كورس`,
      wide: true,
    },
  ];

  onChanged(): void {
    this.store.reload('academy');
  }
}
