# أكاديمية عرابي — الواجهة الأمامية (OrabiAcademy Web)

واجهة أمامية عربية (RTL) لإدارة أكاديمية عرابي، مبنية بـ **Angular 21** (مكوّنات مستقلة / Signals)
وتستهلك واجهات الـ API الموجودة في المشروع الخلفي **ASP.NET Core** بدون أي تعديل عليه.

- **اسم النظام:** OrabiAcademy — أكاديمية عرابي
- **المستخدمون المستهدفون:** موظفو الأكاديمية
- **اللغة:** العربية مع اتجاه RTL وتصميم إداري احترافي (Enterprise Admin UI)
- **الشعار:** `public/logo.png` (منسوخ من `logo.png` في جذر المشروع)

### الهوية البصرية والنظام التصميمي

- **لوحة الألوان:** ثلاثة ألوان أساسية فقط —
  الأزرق الكحلي `#1E293B` (اللون الأساسي: الشريط الجانبي والعناوين)،
  والأزرق المهني `#2563EB` (الأزرار الأساسية وحالات التنقّل النشطة والعناصر التفاعلية)،
  والرمادي المحايد `#FFFFFF` / `#F8FAFC` / `#64748B` (الخلفيات والبطاقات والحدود والنصوص الثانوية).
  وتُستخدم ألوان الحالة الدلالية (أخضر/كهرماني/أحمر) للدلالة على الحالة فقط.
- **الخطوط:** Cairo مع Tajawal كخط احتياطي (مُحمَّلة من Google Fonts) عبر متغيّر `--font`.
- **الأيقونات:** مكتبة [Lucide](https://lucide.dev) عبر حزمة `@lucide/angular`،
  وتُستخدم من خلال مكوّن موحّد `app-icon` بمفاتيح نصية (`students`, `courses`, `calendar-days`, ...)
  بدلاً من الرموز التعبيرية — انظر `src/app/shared/ui/icon.ts`.
- **المسافات:** مقياس 4/8 بكسل، مع ظلال وحدود خفيفة بدلاً من التدرّجات اللونية.

---

## 1) طريقة التشغيل

### أ) تشغيل الواجهة الخلفية أولاً

```powershell
cd D:\ORABI\csharp\OrabiAcademy
dotnet run --project OrabiAcademy --launch-profile http
```

تعمل الواجهة الخلفية على: `http://localhost:5275`
> ملاحظة: يحتاج التطبيق الخلفي إلى وجود مجلد `OrabiAcademy\wwwroot` (يستخدمه `UseStaticFiles()`)،
> وقد أُنشئ هذا المجلد الفارغ — لا يوجد أي تعديل على كود الواجهة الخلفية.

### ب) تشغيل الواجهة الأمامية

```powershell
cd D:\ORABI\csharp\OrabiAcademy\orabi-academy-web
npm install
npm start
```

ثم افتح: `http://localhost:4200/`

> كان مسار المشروع سابقاً يحتوي على الرمز `#` (`D:\ORABI\c#\...`) ولم يكن `npm start` يعمل منه
> لأن خادم Vite لا يخدم الملفات من مسار يحتوي على `#`. بعد نقل المشروع إلى
> `D:\ORABI\csharp\OrabiAcademy` أصبح `npm start` (مع التحديث التلقائي) يعمل بشكل طبيعي.

**بديل: تشغيل نسخة الإنتاج (بنية مُحسّنة):**

```powershell
npm run build:prod
npm run preview:dist
```

ثم افتح: `http://localhost:4300/`

### ج) عنوان الـ API

العنوان معرّف في ملف واحد فقط:

```
src/app/core/config/api.config.ts
```

القيمة الحالية: `http://localhost:5275/api` (سياسة CORS في الواجهة الخلفية تسمح بأي أصل).

---

## 2) العمليات المتاحة (مطابقة كاملة لواجهات الـ API)

كل كيان له صفحة كاملة: عرض + بحث + ترتيب + ترقيم صفحات + إضافة + تعديل + حذف + تفاصيل + تصدير CSV + طباعة.

| الصفحة | المسار | الـ Controller في الواجهة الخلفية |
| --- | --- | --- |
| لوحة المعلومات | `/dashboard` | (تجميع بيانات من كل النقاط) |
| الطلاب | `/students` | `api/Students` |
| أولياء الأمور | `/parents` | `api/Parents` |
| المدربون | `/coaches` | `api/Coaches` |
| الكورسات | `/courses` | `api/Courses` |
| الحصص | `/sessions` | `api/Sessions` |
| التسجيلات | `/registrations` | `api/Registrations` |
| الحضور | `/attendances` | `api/Attendences` |
| التقييمات | `/feedbacks` | `api/Feedbacks` |
| بيانات الأكاديمية | `/academy` | `api/Academies` |

النمط المستخدم لكل كيان:

```
GET    /api/{Controller}
GET    /api/{Controller}/{id}
POST   /api/{Controller}
PUT    /api/{Controller}/{id}
DELETE /api/{Controller}/{id}
```

---

## 3) هيكل المشروع

```
src/app/
├─ core/
│  ├─ config/api.config.ts          عنوان الـ API
│  ├─ models/                       واجهات (interfaces) لكل كيان
│  ├─ services/
│  │  ├─ rest-resource.ts           تنفيذ عام لكل عمليات CRUD
│  │  ├─ entity-resources.ts        خدمة لكل Controller
│  │  ├─ academy-store.ts           مخزن مشترك (لوحة المعلومات + القوائم المنسدلة)
│  │  └─ toast.service.ts           التنبيهات
│  ├─ interceptors/                 توحيد رسائل الأخطاء بالعربية
│  └─ util/format.ts                تعريب الأرقام والتواريخ + ترميز وقت الحصة
├─ shared/crud/
│  ├─ types.ts                      أنواع الأعمدة والحقول
│  ├─ crud-page.ts/.html            صفحة الإدارة العامة (يُعاد استخدامها لكل الكيان)
├─ layout/                          الشريط الجانبي + الشريط العلوي
└─ features/                        صفحة لكل كيان (إعداد أعمدة وحقول فقط)
```

---

## 4) ملاحظة فنية مهمة: ترميز موعد الحصة

في الواجهة الخلفية الحقل `Session.DateTime` من نوع **`int`** (عدد صحيح 32-بت)،
وأكبر قيمة يقبلها هي `2,147,483,647`، لذلك **لا يمكن** تخزين 12 خانة مثل `yyyyMMddHHmm`
(تتجاوز الحد وتسبب خطأ `400 Bad Request`).

الترميز المستخدم في الواجهة الأمامية: **وقت يونكس بالثواني** (عدد الثواني منذ 1970-01-01)،
وهو الأسلوب الأكثر شيوعاً لتخزين تاريخ ووقت داخل عدد صحيح (صالح حتى 2038).

- يظهر في النموذج حقل تاريخ ووقت مألوف (`datetime-local`) ويُحوَّل تلقائياً قبل الإرسال.
- يعرض الجدول القيمة المخزّنة الخام بجانب الصيغة المفهومة للشفافية.
- القراءة متسامحة: تُقرأ أيضاً القيم بصيغة `yyyyMMdd` و `yyyyMMddHHmm` إن وُجدت.

لتغيير الترميز يكفي تعديل ثابت واحد:

```ts
// src/app/core/util/format.ts
export const SESSION_TIME_ENCODING: SessionTimeEncoding = 'unix-seconds';
// القيم الممكنة: 'unix-seconds' | 'yyyyMMdd' | 'yyyyMMddHHmm'
```

---

## 5) أوامر المشروع

| الأمر | الوصف |
| --- | --- |
| `npm start` | خادم التطوير على المنفذ 4200 (مع تحديث تلقائي) |
| `npm run build:prod` | بناء نسخة الإنتاج |
| `npm run preview:dist` | معاينة نسخة البناء على المنفذ 4300 |
| `npm test` | اختبارات الوحدة (Vitest) |
