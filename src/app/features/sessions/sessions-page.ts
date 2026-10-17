import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SessionsService } from '../../core/services/entity-resources';
import { AcademyStore } from '../../core/services/academy-store';
import {
  INT32_MAX,
  SESSION_TIME_ENCODING,
  encodeSessionDateTime,
  formatNumber,
  formatSessionDateTime,
  formatSessionTimeOnly,
  tintFor,
  sessionToInputValue,
} from '../../core/util/format';
import { CrudPage } from '../../shared/crud/crud-page';
import { CrudConfig, DetailItem, FormField, Row, TableColumn } from '../../shared/crud/types';

/**
 * إدارة الحصص.
 *
 * يُخزَّن موعد الحصة في النظام الخلفي داخل حقل من نوع int (عدد صحيح 32-بت)
 * ويستخدم هذا النظام "وقت يونكس بالثواني" كترميز، بينما يعرض النموذج حقل
 * تاريخ ووقت مألوف ويحوّله تلقائياً قبل الإرسال وبعد الاستلام.
 */
@Component({
  selector: 'app-sessions-page',
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
export class SessionsPage {
  private readonly store = inject(AcademyStore);
  readonly resource = inject(SessionsService);
  readonly searchKeys = ['dateTime', 'courseName'];

  readonly config: CrudConfig = {
    title: 'الحصص',
    subtitle: 'جدول الحصص لكل كورس — يُخزَّن الموعد كعدد صحيح (وقت يونكس بالثواني)',
    icon: 'sessions',
    accent: 'bg-slate',
    entityLabel: 'حصة',
    entityPlural: 'الحصص',
    addLabel: 'إضافة حصة',
    searchPlaceholder: 'ابحث بالكورس أو التاريخ...',
    emptyTitle: 'لا توجد حصص مجدولة',
    emptyText: 'أضف حصصاً للكورسات ليتم تسجيل الحضور عليها.',
    exportName: 'sessions',
  };

  readonly columns = computed<TableColumn[]>(() => {
    const courses = this.store.courseById();
    const coaches = this.store.coachById();
    return [
      { key: 'id', label: '#', cell: 'id', width: '76px' },
      {
        key: 'dateTime',
        label: 'موعد الحصة',
        cell: 'primary',
        avatar: () => 'bg-slate',
        sub: (row) => `القيمة المخزّنة: ${row.dateTime}`,
        format: (row) => formatSessionDateTime(row.dateTime),
      },
      {
        key: 'courseName',
        label: 'الكورس',
        value: (row) => courses.get(row.courseID)?.name ?? '',
        format: (row) => courses.get(row.courseID)?.name ?? `كورس #${row.courseID}`,
      },
      {
        key: 'coachName',
        label: 'المدرب',
        value: (row) => coaches.get(courses.get(row.courseID)?.coachID ?? -1)?.name ?? '',
        format: (row) => coaches.get(courses.get(row.courseID)?.coachID ?? -1)?.name ?? '—',
      },
      {
        key: 'attendanceCount',
        label: 'الحضور',
        align: 'center',
        width: '120px',
        cell: 'badge',
        value: (row) => this.store.data().attendences.filter((a) => a.sessionId === row.id).length,
        badge: () => 'badge-blue',
        format: (row) =>
          `${formatNumber(this.store.data().attendences.filter((a) => a.sessionId === row.id).length)} طالب`,
      },
    ];
  });

  readonly fields = computed<FormField[]>(() => [
    {
      key: 'courseID',
      label: 'الكورس',
      kind: 'select',
      required: true,
      options: this.store.courseOptions(),
      placeholder: '— اختر الكورس —',
      hint: 'أضف الكورس أولاً من صفحة الكورسات',
    },
    {
      key: 'dateTime',
      label: 'تاريخ ووقت الحصة',
      kind: 'datetime',
      required: true,
      fromModel: (value) => sessionToInputValue(value as number),
      toModel: (value) => encodeSessionDateTime(value as string),
      validate: (value) =>
        encodeSessionDateTime(value as string) === null
          ? `تعذّر تحويل التاريخ. يجب أن يكون الموعد صالحاً وضمن النطاق المسموح للحقل (حتى 2038 مع ترميز ${SESSION_TIME_ENCODING}).`
          : null,
      hint: `يُخزَّن كرقم صحيح (حتى ${INT32_MAX}) بترميز: ${SESSION_TIME_ENCODING}`,
    },
  ]);

  readonly detail = (row: Row): DetailItem[] => {
    const course = this.store.courseById().get(row.courseID);
    const coach = course ? this.store.coachById().get(course.coachID) : undefined;
    const attendances = this.store.data().attendences.filter((a) => a.sessionId === row.id);
    const names = attendances
      .map((a) => this.store.studentById().get(a.studentId)?.name ?? `طالب #${a.studentId}`)
      .join(' • ');
    return [
      { label: 'رقم الحصة', value: `#${row.id}` },
      { label: 'التاريخ', value: formatSessionDateTime(row.dateTime) },
      { label: 'الوقت', value: formatSessionTimeOnly(row.dateTime) },
      { label: 'القيمة الرقمية', value: String(row.dateTime) },
      { label: 'الكورس', value: course ? `${course.name} — مستوى ${course.level}` : `كورس #${row.courseID}`, wide: true },
      { label: 'المدرب', value: coach?.name ?? '—', wide: true },
      { label: 'عدد الحاضرين', value: formatNumber(attendances.length) },
      { label: 'الطلاب الحاضرون', value: names || 'لا يوجد', wide: true },
    ];
  };

  onChanged(): void {
    this.store.reload('sessions');
  }
}
