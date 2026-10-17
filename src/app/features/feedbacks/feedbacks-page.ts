import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FeedbacksService } from '../../core/services/entity-resources';
import { AcademyStore } from '../../core/services/academy-store';
import { formatNumber, tintFor } from '../../core/util/format';
import { CrudPage } from '../../shared/crud/crud-page';
import { CrudConfig, DetailItem, FormField, Row, TableColumn } from '../../shared/crud/types';

/** تقييمات وملاحظات المدربين على الطلاب */
@Component({
  selector: 'app-feedbacks-page',
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
export class FeedbacksPage {
  private readonly store = inject(AcademyStore);
  readonly resource = inject(FeedbacksService);
  readonly searchKeys = ['content', 'studentName', 'courseName'];

  readonly config: CrudConfig = {
    title: 'التقييمات',
    subtitle: 'ملاحظات المدربين على أداء الطلاب في الكورسات',
    icon: 'feedbacks',
    accent: 'bg-slate',
    entityLabel: 'تقييم',
    entityPlural: 'التقييمات',
    addLabel: 'إضافة تقييم',
    searchPlaceholder: 'ابحث في نص التقييم أو باسم الطالب...',
    emptyTitle: 'لا توجد تقييمات بعد',
    emptyText: 'أضف ملاحظاتك على أداء الطلاب لمتابعة تقدمهم.',
    exportName: 'feedbacks',
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
        value: (row) => students.get(row.studentID)?.name ?? '',
        avatar: (row) => tintFor(students.get(row.studentID)?.name ?? row.studentID),
        sub: (row) => courses.get(row.courseID)?.name ?? 'كورس غير معروف',
        format: (row) => students.get(row.studentID)?.name ?? `طالب #${row.studentID}`,
      },
      {
        key: 'content',
        label: 'نص التقييم',
        format: (row) => row.content ?? '—',
      },
      {
        key: 'courseName',
        label: 'الكورس',
        cell: 'badge',
        badge: () => 'badge-blue',
        value: (row) => courses.get(row.courseID)?.name ?? '',
        format: (row) => courses.get(row.courseID)?.name ?? `كورس #${row.courseID}`,
      },
      {
        key: 'coachName',
        label: 'المدرب',
        value: (row) => coaches.get(courses.get(row.courseID)?.coachID ?? -1)?.name ?? '',
        format: (row) => coaches.get(courses.get(row.courseID)?.coachID ?? -1)?.name ?? '—',
      },
    ];
  });

  readonly fields = computed<FormField[]>(() => [
    {
      key: 'studentID',
      label: 'الطالب',
      kind: 'select',
      required: true,
      options: this.store.studentOptions(),
      placeholder: '— اختر الطالب —',
    },
    {
      key: 'courseID',
      label: 'الكورس',
      kind: 'select',
      required: true,
      options: this.store.courseOptions(),
      placeholder: '— اختر الكورس —',
    },
    {
      key: 'content',
      label: 'نص التقييم / الملاحظة',
      kind: 'textarea',
      required: true,
      span2: true,
      placeholder: 'مثال: تحسّن ملحوظ في اللياقة البدنية والالتزام بالتدريبات...',
      maxLength: 1000,
    },
  ]);

  readonly detail = (row: Row): DetailItem[] => {
    const student = this.store.studentById().get(row.studentID);
    const course = this.store.courseById().get(row.courseID);
    const coach = course ? this.store.coachById().get(course.coachID) : undefined;
    const parent = student ? this.store.parentById().get(student.parentId) : undefined;
    const total = student ? this.store.feedbacksOfStudent(student.id).length : 0;
    return [
      { label: 'رقم التقييم', value: `#${row.id}` },
      { label: 'الطالب', value: student?.name ?? `طالب #${row.studentID}` },
      { label: 'ولي الأمر', value: parent ? `${parent.name} — ${parent.phone}` : '—' },
      { label: 'الكورس', value: course ? `${course.name} — مستوى ${course.level}` : `كورس #${row.courseID}` },
      { label: 'المدرب', value: coach?.name ?? '—' },
      { label: 'إجمالي تقييمات الطالب', value: formatNumber(total) },
      { label: 'نص التقييم', value: row.content || '—', wide: true },
    ];
  };

  onChanged(): void {
    this.store.reload('feedbacks');
  }
}
