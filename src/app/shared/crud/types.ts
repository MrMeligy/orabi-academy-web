import { IconName } from '../ui/icon';

/** أنواع الحقول المدعومة في النماذج */
export type FieldKind =
  | 'text'
  | 'number'
  | 'email'
  | 'tel'
  | 'date'
  | 'time'
  | 'datetime'
  | 'textarea'
  | 'select';

export interface FieldOption {
  value: string | number | null;
  label: string;
}

/**
 * وصف حقل في نموذج الإضافة/التعديل.
 * `fromModel` تُستخدم عند فتح السجل للتعديل لتحويل القيمة القادمة من الخادم
 * إلى قيمة مناسبة للحقل، و`toModel` تُستخدم قبل الإرسال للخادم.
 */
export interface FormField {
  key: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  options?: FieldOption[];
  span2?: boolean;
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  fromModel?: (value: any) => any;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  toModel?: (value: any) => any;
  /** تحقق مخصص: يُعيد نص الخطأ أو null إذا كانت القيمة صحيحة */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  validate?: (value: any) => string | null;
}

/** شكل عرض عمود داخل الجدول */
export interface TableColumn {
  key: string;
  label: string;
  align?: 'start' | 'center' | 'end';
  width?: string;
  sortable?: boolean;
  /** شكل الخلية */
  cell?: 'text' | 'primary' | 'badge' | 'id' | 'mono';
  /** القيمة المستخدمة في الترتيب والبحث (افتراضياً row[key]) */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  value?: (row: any) => any;
  /** القيمة المعروضة كسطر رئيسي (افتراضياً القيمة) */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  display?: (row: any) => any;
  /** سطر فرعي أسفل السطر الرئيسي عند cell = primary */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  sub?: (row: any) => string | null | undefined;
  /** صف اللون الهادئ للأفاتار عند cell = primary */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  avatar?: (row: any) => string | undefined;
  /** لون الوسم عند cell = badge (اسم كلاس مثل badge-blue) */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  badge?: (row: any) => string | undefined;
  /** تنسيق النص */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  format?: (row: any) => string;
}

export interface CrudConfig {
  /** عنوان الصفحة */
  title: string;
  /** وصف أسفل العنوان */
  subtitle?: string;
  /** أيقونة الكيان */
  icon: IconName;
  /** صف اللون الهادئ لأيقونة الصفحة (bg-blue, bg-slate, ...) */
  accent: string;
  /** اسم الكيان المفرد للاستخدام في الرسائل، مثل "طالب" */
  entityLabel: string;
  /** اسم الكيان بصيغة الجمع، مثل "الطلاب" */
  entityPlural: string;
  addLabel?: string;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyText?: string;
  pageSize?: number;
  /** تسمية عمود الإجراءات */
  actionsLabel?: string;
  /** ملف تصدير CSV */
  exportName?: string;
}

export interface DetailItem {
  label: string;
  value: string;
  /** امتداد كامل العرض */
  wide?: boolean;
}

/**
 * صف عام قادم من الواجهة الخلفية.
 * كل كيان يملك حقولاً مختلفة، والحقول تُقرأ/تُكتب ديناميكياً حسب إعداد الأعمدة،
 * لذلك يُستخدم نوع مفتوح هنا لتجنّب فرض شكل واحد على كل الكيانات.
 */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type Row = any;

/** قيم نموذج الإضافة/التعديل قبل التحويل والإرسال */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type FormModel = Record<string, any>;
