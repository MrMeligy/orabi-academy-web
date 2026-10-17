/**
 * أدوات التنسيق والتعريب.
 * الأرقام تُعرض بالصيغة اللاتينية (0-9) لتسهيل القراءة والبحث،
 * مع أسماء الشهور والأيام بالعربية.
 */

const AR = 'ar-EG-u-nu-latn';

const dateFmt = new Intl.DateTimeFormat(AR, {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

const shortDateFmt = new Intl.DateTimeFormat(AR, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const timeFmt = new Intl.DateTimeFormat(AR, {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

export const ARABIC_DAYS = [
  'السبت',
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
] as const;

export function formatDate(value: string | Date | null | undefined, style: 'long' | 'short' = 'long'): string {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return (style === 'long' ? dateFmt : shortDateFmt).format(date);
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat(AR).format(value);
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${new Intl.NumberFormat(AR).format(value)} ج.م`;
}

/** الحصول على الحروف الأولى من الاسم لعرضها في الأفاتار */
export function initials(name: string | null | undefined, max = 2): string {
  if (!name) return '؟';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '؟';
  return parts
    .slice(0, max)
    .map((p) => p.charAt(0))
    .join('');
}

/** اختيار صفّ لون هادئ ثابت انطلاقاً من نص (للأفاتار) */
const TINTS = ['bg-blue', 'bg-slate'];

export function tintFor(seed: string | number | null | undefined): string {
  const s = String(seed ?? '');
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) % 100000;
  }
  return TINTS[hash % TINTS.length];
}

/* ============ الحصص: التاريخ مخزّن في عدد صحيح (int) ============ */

/**
 * ⚠️ ملاحظة مهمة حول النظام الخلفي:
 * الحقل `Session.DateTime` مُعرَّف في الواجهة الخلفية كـ `int` (عدد صحيح 32-بت)،
 * وأكبر قيمة يقبلها هي 2,147,483,647، لذلك لا يمكن تخزين 12 خانة مثل
 * yyyyMMddHHmm (تتجاوز الحد وتسبب خطأ 400).
 *
 * الترميز المستخدم افتراضياً هو "وقت يونكس بالثواني" (عدد الثواني منذ 1970-01-01)
 * وهو الأكثر شيوعاً لتخزين تاريخ ووقت داخل عدد صحيح.
 *
 * لتغيير الترميز يكفي تعديل الثابت التالي فقط:
 */
export type SessionTimeEncoding = 'unix-seconds' | 'yyyyMMdd' | 'yyyyMMddHHmm';
export const SESSION_TIME_ENCODING: SessionTimeEncoding = 'unix-seconds';

/** أقصى قيمة يقبلها النوع int في SQL Server / C# */
export const INT32_MAX = 2147483647;

export interface SessionMoment {
  date: Date;
  /** هل يحتوي الرقم المخزّن على وقت (ساعات ودقائق)؟ */
  hasTime: boolean;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * قراءة الرقم المخزّن وتحويله إلى تاريخ مفهوم.
 * متسامحة مع أكثر من ترميز حتى تظهر أي بيانات قديمة بشكل صحيح.
 */
export function parseSessionDateTime(value: number | string | null | undefined): SessionMoment | null {
  if (value === null || value === undefined || value === '') return null;
  const raw = String(value).trim();
  if (!/^\d{1,12}$/.test(raw)) return null;

  // 1) yyyyMMddHHmm — 12 خانة
  if (raw.length === 12) {
    return fromParts(raw.slice(0, 4), raw.slice(4, 6), raw.slice(6, 8), raw.slice(8, 10), raw.slice(10, 12), true);
  }

  // 2) yyyyMMdd — 8 خانات (تاريخ بدون وقت)
  if (raw.length === 8) {
    const year = Number(raw.slice(0, 4));
    if (year >= 1900 && year <= 2200) {
      return fromParts(raw.slice(0, 4), raw.slice(4, 6), raw.slice(6, 8), '00', '00', false);
    }
  }

  // 3) وقت يونكس بالثواني
  const seconds = Number(raw);
  if (Number.isFinite(seconds) && seconds >= 0 && seconds <= INT32_MAX) {
    const date = new Date(seconds * 1000);
    if (!Number.isNaN(date.getTime())) return { date, hasTime: true };
  }

  return null;
}

function fromParts(
  y: string,
  mo: string,
  d: string,
  h: string,
  mi: string,
  hasTime: boolean,
): SessionMoment | null {
  const year = Number(y);
  const month = Number(mo);
  const day = Number(d);
  const hour = Number(h);
  const minute = Number(mi);
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) return null;
  const date = new Date(year, month - 1, day, hour, minute);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return { date, hasTime };
}

/** صياغة مقروءة بالعربية لتاريخ ووقت الحصة */
export function formatSessionDateTime(value: number | string | null | undefined): string {
  const parsed = parseSessionDateTime(value);
  if (!parsed) {
    return value === null || value === undefined || value === '' ? '—' : `قيمة غير معروفة (${value})`;
  }
  return parsed.hasTime
    ? `${dateFmt.format(parsed.date)} — ${timeFmt.format(parsed.date)}`
    : dateFmt.format(parsed.date);
}

export function formatSessionDateOnly(value: number | string | null | undefined): string {
  const parsed = parseSessionDateTime(value);
  return parsed ? dateFmt.format(parsed.date) : '—';
}

export function formatSessionTimeOnly(value: number | string | null | undefined): string {
  const parsed = parseSessionDateTime(value);
  return parsed && parsed.hasTime ? timeFmt.format(parsed.date) : '—';
}

/** تحويل الرقم المخزّن إلى قيمة يستهلكها حقل datetime-local */
export function sessionToInputValue(value: number | null | undefined): string {
  const parsed = parseSessionDateTime(value);
  if (!parsed) return '';
  const d = parsed.date;
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/**
 * تحويل قيمة حقل datetime-local إلى الرقم الذي يتوقعه النظام الخلفي.
 * تُعيد null إذا كانت القيمة غير صالحة أو تتجاوز الحد المسموح لنوع int.
 */
export function encodeSessionDateTime(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!match) return null;
  const [, y, mo, d, h, mi] = match;

  let encoded: number;
  switch (SESSION_TIME_ENCODING) {
    case 'yyyyMMdd':
      encoded = Number(`${y}${mo}${d}`);
      break;
    case 'yyyyMMddHHmm':
      encoded = Number(`${y}${mo}${d}${h}${mi}`);
      break;
    default: {
      const date = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi));
      if (Number.isNaN(date.getTime())) return null;
      encoded = Math.floor(date.getTime() / 1000);
    }
  }

  if (!Number.isFinite(encoded) || encoded < 0 || encoded > INT32_MAX) return null;
  return encoded;
}

/* ============ أدوات عامة ============ */

/** مقارنة نصية عربية للترتيب الأبجدي */
export function arabicSort(a: unknown, b: unknown): number {
  return String(a ?? '').localeCompare(String(b ?? ''), 'ar');
}

export function normalize(value: unknown): string {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[\u064B-\u0652\u0640]/g, '')
    .trim();
}

export function includes(value: unknown, query: string): boolean {
  if (!query) return true;
  return normalize(value).includes(normalize(query));
}
