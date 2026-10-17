import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

/** خطأ موحّد برسالة عربية جاهزة للعرض */
export interface ApiError {
  status: number;
  title: string;
  detail: string;
  url?: string;
}

/** استخراج نص مقروء من أي خطأ (شبكة، خادم، أو خطأ برمجي) */
export function describeError(error: unknown): ApiError {
  if (error && typeof error === 'object' && 'detail' in error && 'title' in error) {
    return error as ApiError;
  }

  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return {
        status: 0,
        title: 'تعذّر الاتصال بالخادم',
        detail: `تأكد من تشغيل الواجهة الخلفية وأن العنوان ${API_BASE_URL} يعمل بشكل صحيح.`,
        url: error.url ?? undefined,
      };
    }
    if (error.status === 404) {
      return { status: 404, title: 'العنصر غير موجود', detail: 'ربما تم حذف هذا العنصر مسبقاً.', url: error.url ?? undefined };
    }
    if (error.status === 400) {
      return {
        status: 400,
        title: 'بيانات غير صحيحة',
        detail: 'راجع الحقول المدخلة، خصوصاً الحقول المرتبطة بكيان آخر (مثل ولي الأمر أو الكورس).',
        url: error.url ?? undefined,
      };
    }
    if (error.status === 409) {
      return { status: 409, title: 'تعارض في البيانات', detail: 'لا يمكن إتمام العملية بسبب ارتباط هذا العنصر ببيانات أخرى.', url: error.url ?? undefined };
    }
    if (error.status === 500) {
      return {
        status: 500,
        title: 'خطأ في الخادم',
        detail: 'حدث خطأ أثناء معالجة الطلب. تأكد من صحة البيانات المرتبطة (قد يكون المفتاح الأجنبي غير موجود).',
        url: error.url ?? undefined,
      };
    }
    return {
      status: error.status,
      title: `فشل الطلب (${error.status})`,
      detail: error.statusText || 'حدث خطأ غير متوقع.',
      url: error.url ?? undefined,
    };
  }

  return {
    status: -1,
    title: 'خطأ غير متوقع',
    detail: error instanceof Error ? error.message : 'يرجى المحاولة مرة أخرى.',
  };
}

/** يحوّل كل أخطاء HTTP إلى ApiError موحّد */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(catchError((error: unknown) => throwError(() => describeError(error))));
