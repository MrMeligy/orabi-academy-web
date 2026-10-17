import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  LucideAlertTriangle,
  LucideArrowUpLeft,
  LucideBookOpen,
  LucideCalendar,
  LucideCalendarDays,
  LucideChartNoAxesColumn,
  LucideChevronDown,
  LucideChevronLeft,
  LucideChevronRight,
  LucideChevronUp,
  LucideChevronsLeft,
  LucideChevronsRight,
  LucideChevronsUpDown,
  LucideCircleCheck,
  LucideClipboardCheck,
  LucideDownload,
  LucideEye,
  LucideFileText,
  LucideGraduationCap,
  LucideInbox,
  LucideInfo,
  LucideLandmark,
  LucideLayoutDashboard,
  LucideListChecks,
  LucideMenu,
  LucideMessageSquare,
  LucidePencil,
  LucidePin,
  LucidePlus,
  LucidePrinter,
  LucideRefreshCw,
  LucideSave,
  LucideSearch,
  LucideShieldCheck,
  LucideTrash2,
  LucideUserCheck,
  LucideUsers,
  LucideX,
  LucideZap,
} from '@lucide/angular';

/** أسماء الأيقونات المستخدمة في النظام (مفاتيح ثابتة تعمل مع مكوّن الأيقونة) */
export type IconName =
  // كيانات التنقّل
  | 'dashboard'
  | 'students'
  | 'parents'
  | 'coaches'
  | 'courses'
  | 'sessions'
  | 'registrations'
  | 'attendances'
  | 'feedbacks'
  | 'academy'
  // عناصر الواجهة
  | 'menu'
  | 'close'
  | 'refresh'
  | 'calendar'
  | 'arrow'
  | 'plus'
  | 'search'
  | 'printer'
  | 'download'
  | 'eye'
  | 'edit'
  | 'trash'
  | 'save'
  | 'inbox'
  | 'info'
  | 'alert'
  | 'check'
  | 'chart'
  | 'list'
  | 'pin'
  | 'zap'
  | 'shield'
  // ترقيم الصفحات والترتيب
  | 'first'
  | 'prev'
  | 'next'
  | 'last'
  | 'sort'
  | 'asc'
  | 'desc';

/**
 * أيقونة SVG موحّدة مبنية على مكتبة Lucide.
 * تُستخدم في كل الواجهة بدلاً من الرموز التعبيرية (emojis) لضمان شكل احترافي متّسق.
 */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-icon' },
  imports: [
    LucideLayoutDashboard,
    LucideGraduationCap,
    LucideUsers,
    LucideUserCheck,
    LucideBookOpen,
    LucideCalendarDays,
    LucideFileText,
    LucideClipboardCheck,
    LucideMessageSquare,
    LucideLandmark,
    LucideMenu,
    LucideX,
    LucideRefreshCw,
    LucideCalendar,
    LucideArrowUpLeft,
    LucidePlus,
    LucideSearch,
    LucidePrinter,
    LucideDownload,
    LucideEye,
    LucidePencil,
    LucideTrash2,
    LucideSave,
    LucideInbox,
    LucideInfo,
    LucideAlertTriangle,
    LucideCircleCheck,
    LucideChartNoAxesColumn,
    LucideListChecks,
    LucidePin,
    LucideZap,
    LucideShieldCheck,
    LucideChevronsRight,
    LucideChevronRight,
    LucideChevronLeft,
    LucideChevronsLeft,
    LucideChevronsUpDown,
    LucideChevronUp,
    LucideChevronDown,
  ],
  template: `
    @switch (name()) {
      @case ('dashboard') { <svg lucideLayoutDashboard [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('students') { <svg lucideGraduationCap [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('parents') { <svg lucideUsers [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('coaches') { <svg lucideUserCheck [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('courses') { <svg lucideBookOpen [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('sessions') { <svg lucideCalendarDays [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('registrations') { <svg lucideFileText [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('attendances') { <svg lucideClipboardCheck [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('feedbacks') { <svg lucideMessageSquare [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('academy') { <svg lucideLandmark [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('menu') { <svg lucideMenu [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('close') { <svg lucideX [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('refresh') { <svg lucideRefreshCw [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('calendar') { <svg lucideCalendar [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('arrow') { <svg lucideArrowUpLeft [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('plus') { <svg lucidePlus [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('search') { <svg lucideSearch [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('printer') { <svg lucidePrinter [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('download') { <svg lucideDownload [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('eye') { <svg lucideEye [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('edit') { <svg lucidePencil [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('trash') { <svg lucideTrash2 [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('save') { <svg lucideSave [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('inbox') { <svg lucideInbox [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('info') { <svg lucideInfo [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('alert') { <svg lucideAlertTriangle [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('check') { <svg lucideCircleCheck [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('chart') { <svg lucideChartNoAxesColumn [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('list') { <svg lucideListChecks [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('pin') { <svg lucidePin [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('zap') { <svg lucideZap [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('shield') { <svg lucideShieldCheck [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('first') { <svg lucideChevronsRight [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('prev') { <svg lucideChevronRight [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('next') { <svg lucideChevronLeft [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('last') { <svg lucideChevronsLeft [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('sort') { <svg lucideChevronsUpDown [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('asc') { <svg lucideChevronUp [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
      @case ('desc') { <svg lucideChevronDown [size]="size()" [strokeWidth]="strokeWidth()"></svg> }
    }
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(18);
  readonly strokeWidth = input(2);
}
