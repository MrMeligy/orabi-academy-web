import { IconName } from '../shared/ui/icon';

export interface NavItem {
  path: string;
  label: string;
  icon: IconName;
  accent: string;
  group: string;
  hint: string;
  /** مفتاح الكيان في المخزن لعرض عدد السجلات */
  countKey?: 'academy' | 'coaches' | 'parents' | 'students' | 'courses' | 'sessions' | 'registrations' | 'attendences' | 'feedbacks';
}

export const NAV_ITEMS: NavItem[] = [
  {
    path: '/dashboard',
    label: 'لوحة المعلومات',
    icon: 'dashboard',
    accent: 'bg-blue',
    group: 'الرئيسية',
    hint: 'نظرة شاملة على الأكاديمية',
  },
  {
    path: '/students',
    label: 'الطلاب',
    icon: 'students',
    accent: 'bg-blue',
    group: 'الأعضاء',
    hint: 'إدارة بيانات الطلاب',
    countKey: 'students',
  },
  {
    path: '/parents',
    label: 'أولياء الأمور',
    icon: 'parents',
    accent: 'bg-slate',
    group: 'الأعضاء',
    hint: 'بيانات التواصل مع الأسر',
    countKey: 'parents',
  },
  {
    path: '/coaches',
    label: 'المدربون',
    icon: 'coaches',
    accent: 'bg-blue',
    group: 'الأعضاء',
    hint: 'فريق التدريب',
    countKey: 'coaches',
  },
  {
    path: '/courses',
    label: 'الكورسات',
    icon: 'courses',
    accent: 'bg-blue',
    group: 'العملية التعليمية',
    hint: 'الكورسات والمستويات',
    countKey: 'courses',
  },
  {
    path: '/sessions',
    label: 'الحصص',
    icon: 'sessions',
    accent: 'bg-slate',
    group: 'العملية التعليمية',
    hint: 'جدول الحصص',
    countKey: 'sessions',
  },
  {
    path: '/registrations',
    label: 'التسجيلات',
    icon: 'registrations',
    accent: 'bg-blue',
    group: 'العملية التعليمية',
    hint: 'تسجيل الطلاب في الكورسات',
    countKey: 'registrations',
  },
  {
    path: '/attendances',
    label: 'الحضور',
    icon: 'attendances',
    accent: 'bg-blue',
    group: 'المتابعة',
    hint: 'حضور الطلاب في الحصص',
    countKey: 'attendences',
  },
  {
    path: '/feedbacks',
    label: 'التقييمات',
    icon: 'feedbacks',
    accent: 'bg-slate',
    group: 'المتابعة',
    hint: 'ملاحظات وتقييمات الطلاب',
    countKey: 'feedbacks',
  },
  {
    path: '/academy',
    label: 'بيانات الأكاديمية',
    icon: 'academy',
    accent: 'bg-slate',
    group: 'الإعدادات',
    hint: 'الاسم والبريد والهاتف',
    countKey: 'academy',
  },
];

export const NAV_GROUPS = ['الرئيسية', 'الأعضاء', 'العملية التعليمية', 'المتابعة', 'الإعدادات'];

export function itemsOfGroup(group: string): NavItem[] {
  return NAV_ITEMS.filter((item) => item.group === group);
}
