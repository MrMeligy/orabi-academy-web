import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { describeError } from '../../core/interceptors/http-error.interceptor';
import { CrudResource } from '../../core/services/rest-resource';
import { ToastService } from '../../core/services/toast.service';
import { arabicSort, includes } from '../../core/util/format';
import { Icon, IconName } from '../ui/icon';
import { CrudConfig, DetailItem, FormField, FormModel, Row, TableColumn } from './types';

export type { FormModel, Row };

interface SortState {
  key: string;
  dir: 'asc' | 'desc';
}

/**
 * صفحة إدارة عامة (عرض/إضافة/تعديل/حذف/بحث/ترتيب/تصدير) مبنية فوق واجهات
 * الـ CRUD الموجودة في النظام الخلفي، وتُستخدم لكل الكيانات مع تخصيص الأعمدة والحقول.
 */
@Component({
  selector: 'app-crud-page',
  templateUrl: './crud-page.html',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrudPage implements OnInit {
  private readonly toast = inject(ToastService);
  private lastRefreshToken = 0;

  readonly resource = input.required<CrudResource<{ id: number }>>();
  readonly config = input.required<CrudConfig>();  readonly columns = input.required<TableColumn[]>();
  readonly fields = input.required<FormField[]>();
  readonly searchKeys = input<string[]>([]);
  readonly defaults = input<FormModel>({});
  /** تعديل الصفوف قبل العرض (مثلاً إضافة اسم ولي الأمر) */
  readonly enrich = input<((rows: Row[]) => Row[]) | null>(null);
  /** دوال تعرض تفاصيل إضافية في نافذة منبثقة */
  readonly detail = input<((row: Row) => DetailItem[] | null) | null>(null);
  /** زيادة هذا الرقم تؤدي إلى إعادة تحميل البيانات */
  readonly refreshToken = input<number>(0);

  readonly dataChanged = output<void>();

  readonly rows = signal<Row[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly search = signal('');
  readonly sort = signal<SortState | null>(null);
  readonly pageSize = signal(10);
  readonly page = signal(1);
  readonly pageSizeOptions = [5, 10, 25, 50, 100];

  readonly formOpen = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly formModel = signal<FormModel>({});
  readonly formErrors = signal<Record<string, string>>({});
  readonly saving = signal(false);
  readonly serverError = signal<string | null>(null);

  readonly confirmRow = signal<Row | null>(null);
  readonly deleting = signal(false);
  readonly detailRow = signal<Row | null>(null);

  constructor() {
    effect(() => {
      const token = this.refreshToken();
      if (token === this.lastRefreshToken) return;
      this.lastRefreshToken = token;
      if (token > 0) untracked(() => this.load(false));
    });
  }

  ngOnInit(): void {
    this.pageSize.set(this.config().pageSize ?? 10);
    this.load();
  }

  /* ===================== التحميل ===================== */

  load(showSpinner = true): void {
    if (showSpinner) this.loading.set(true);
    this.loadError.set(null);
    this.resource()
      .list()
      .subscribe({
        next: (data) => {
          const rows = (data ?? []) as unknown as Row[];
          const enrich = this.enrich();
          this.rows.set(enrich ? enrich(rows.map((r) => ({ ...r }))) : rows);
          const maxPage = Math.max(1, Math.ceil(this.totalFiltered() / this.pageSize()));
          if (this.page() > maxPage) this.page.set(maxPage);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.loadError.set(describeError(err).detail);
        },
      });
  }

  /* ===================== البحث والترتيب ===================== */

  private cellValue(row: Row, col: TableColumn): unknown {
    if (col.value) return col.value(row);
    return row[col.key];
  }

  readonly filtered = computed(() => {
    const query = this.search().trim();
    const keys = this.searchKeys();
    const rows = this.rows();
    if (!query) return rows;
    const columns = this.columns();
    return rows.filter((row) => {
      const candidates = keys.length
        ? keys.flatMap((key) => {
            const raw = row[key];
            if (raw !== undefined && raw !== null) return [raw];
            // مفاتيح محسوبة (مثل اسم الطالب داخل التسجيلات) تُقرأ من الأعمدة
            const col = columns.find((c) => c.key === key);
            return col ? [this.cellValue(row, col)] : [];
          })
        : columns.map((c) => this.cellValue(row, c));
      return candidates.some((v) => includes(v, query));
    });
  });

  readonly sorted = computed(() => {
    const state = this.sort();
    const rows = [...this.filtered()];
    if (!state) return rows;
    const col = this.columns().find((c) => c.key === state.key);
    if (!col) return rows;
    rows.sort((a, b) => {
      const av = this.cellValue(a, col);
      const bv = this.cellValue(b, col);
      let result: number;
      if (typeof av === 'number' && typeof bv === 'number') {
        result = av - bv;
      } else {
        result = arabicSort(av, bv);
      }
      return state.dir === 'asc' ? result : -result;
    });
    return rows;
  });

  readonly totalFiltered = computed(() => this.sorted().length);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalFiltered() / this.pageSize())));

  readonly paged = computed(() => {
    const size = this.pageSize();
    const start = (this.page() - 1) * size;
    return this.sorted().slice(start, start + size);
  });

  readonly rangeLabel = computed(() => {
    const total = this.totalFiltered();
    if (total === 0) return 'لا توجد نتائج';
    const size = this.pageSize();
    const from = (this.page() - 1) * size + 1;
    const to = Math.min(this.page() * size, total);
    return `عرض ${from}–${to} من إجمالي ${total}`;
  });

  readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    const windowSize = 5;
    let start = Math.max(1, current - Math.floor(windowSize / 2));
    const end = Math.min(total, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    const pages: number[] = [];
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  });

  onSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  clearSearch(): void {
    this.onSearch('');
  }

  onPageSize(value: string): void {
    this.pageSize.set(Number(value));
    this.page.set(1);
  }

  toggleSort(col: TableColumn): void {
    if (col.sortable === false) return;
    const current = this.sort();
    if (current && current.key === col.key) {
      this.sort.set({ key: col.key, dir: current.dir === 'asc' ? 'desc' : 'asc' });
    } else {
      this.sort.set({ key: col.key, dir: 'asc' });
    }
  }

  sortIcon(col: TableColumn): IconName {
    const current = this.sort();
    if (!current || current.key !== col.key) return 'sort';
    return current.dir === 'asc' ? 'asc' : 'desc';
  }

  goTo(page: number): void {
    this.page.set(Math.min(Math.max(1, page), this.totalPages()));
  }

  /* ===================== النموذج ===================== */

  openCreate(): void {
    const model: FormModel = {};
    for (const field of this.fields()) {
      const preset = this.defaults()[field.key];
      model[field.key] =
        preset !== undefined ? preset : field.kind === 'select' || field.kind === 'number' ? null : '';
    }
    this.editingId.set(null);
    this.formModel.set(model);
    this.formErrors.set({});
    this.serverError.set(null);
    this.formOpen.set(true);
  }

  openEdit(row: Row): void {
    const model: FormModel = {};
    for (const field of this.fields()) {
      const raw = row[field.key];
      model[field.key] = field.fromModel ? field.fromModel(raw) : (raw ?? null);
    }
    this.editingId.set(Number(row.id));
    this.formModel.set(model);
    this.formErrors.set({});
    this.serverError.set(null);
    this.formOpen.set(true);
  }

  closeForm(): void {
    if (this.saving()) return;
    this.formOpen.set(false);
  }

  /** نوع حقل HTML المناسب (حقل datetime يُعرض بـ datetime-local) */
  inputType(field: FormField): string {
    return field.kind === 'datetime' ? 'datetime-local' : field.kind;
  }

  fieldValue(field: FormField): string {    const value = this.formModel()[field.key];
    if (value === null || value === undefined) return '';
    return String(value);
  }

  onFieldChange(field: FormField, raw: string): void {
    this.formModel.update((model) => ({ ...model, [field.key]: raw }));
    if (this.formErrors()[field.key]) {
      this.formErrors.update((errors) => {
        const next = { ...errors };
        delete next[field.key];
        return next;
      });
    }
  }

  isInvalid(field: FormField): boolean {
    return Boolean(this.formErrors()[field.key]);
  }

  errorFor(field: FormField): string | undefined {
    return this.formErrors()[field.key];
  }

  isEditing(): boolean {
    return this.editingId() !== null;
  }

  private coerce(field: FormField, value: unknown): unknown {
    if (field.toModel) return field.toModel(value);
    if (value === '' || value === null || value === undefined) {
      if (field.kind === 'number') return null;
      return field.kind === 'select' ? null : '';
    }
    if (field.kind === 'number') {
      const num = Number(value);
      return Number.isNaN(num) ? null : num;
    }
    if (field.kind === 'select') {
      const options = field.options ?? [];
      const allNumeric = options.length > 0 && options.every((o) => typeof o.value === 'number');
      if (allNumeric) {
        const num = Number(value);
        return Number.isNaN(num) ? null : num;
      }
      return String(value);
    }
    return typeof value === 'string' ? value.trim() : value;
  }

  private validate(): boolean {
    const errors: Record<string, string> = {};
    const model = this.formModel();
    for (const field of this.fields()) {
      const value = model[field.key];
      const empty = value === null || value === undefined || (typeof value === 'string' && value.trim() === '');

      if (field.required && empty) {
        errors[field.key] = `حقل «${field.label}» مطلوب`;
        continue;
      }
      if (empty) continue;

      const text = String(value).trim();
      if (field.kind === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text)) {
        errors[field.key] = 'صيغة البريد الإلكتروني غير صحيحة';
      } else if (field.kind === 'tel' && !/^[0-9+\-\s()]{6,20}$/.test(text)) {
        errors[field.key] = 'صيغة رقم الهاتف غير صحيحة';
      } else if (field.validate) {
        const message = field.validate(value);
        if (message) errors[field.key] = message;
      }
    }
    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  save(): void {
    if (this.saving()) return;
    if (!this.validate()) {
      this.toast.warn('تحقق من البيانات', 'هناك حقول مطلوبة أو غير صحيحة.');
      return;
    }

    const payload: FormModel = {};
    for (const field of this.fields()) {
      payload[field.key] = this.coerce(field, this.formModel()[field.key]);
    }

    this.saving.set(true);
    this.serverError.set(null);
    const id = this.editingId();
    const resource = this.resource();
    const { entityLabel, entityPlural } = this.config();

    const request =
      id === null
        ? resource.create(payload as { id: number })
        : resource.update(id, { ...payload, id } as { id: number });

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.formOpen.set(false);
        this.toast.success(
          id === null ? `تم إضافة ${entityLabel}` : `تم تحديث ${entityLabel}`,
          `تمت العملية بنجاح وحُفظت البيانات في ${entityPlural}.`,
        );
        this.load(false);
        this.dataChanged.emit();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        const info = describeError(err);
        this.serverError.set(`${info.title}: ${info.detail}`);
        this.toast.error(info.title, info.detail);
      },
    });
  }

  /* ===================== الحذف ===================== */

  askDelete(row: Row): void {
    this.confirmRow.set(row);
  }

  cancelDelete(): void {
    this.confirmRow.set(null);
  }

  confirmDelete(): void {
    const row = this.confirmRow();
    if (!row) return;
    this.deleting.set(true);
    this.resource()
      .remove(Number(row.id))
      .subscribe({
        next: () => {
          this.deleting.set(false);
          this.confirmRow.set(null);
          this.toast.success('تم الحذف', `تم حذف ${this.config().entityLabel} من ${this.config().entityPlural}.`);
          this.load(false);
          this.dataChanged.emit();
        },
        error: (err: unknown) => {
          this.deleting.set(false);
          const info = describeError(err);
          this.toast.error(info.title, info.detail);
        },
      });
  }

  deleteLabel(): string {
    const row = this.confirmRow();
    return row ? this.rowTitle(row) : '';
  }

  /* ===================== العرض ===================== */

  rowTitle(row: Row): string {
    if (!row) return '';
    const col = this.columns().find((c) => c.cell === 'primary') ?? this.columns()[0];
    if (!col) return `#${row.id}`;
    const value = col.format ? col.format(row) : col.display ? col.display(row) : this.cellValue(row, col);
    return value === null || value === undefined || value === '' ? `#${row.id}` : String(value);
  }

  cellText(col: TableColumn, row: Row): string {
    if (col.format) return col.format(row);
    const value = col.display ? col.display(row) : this.cellValue(row, col);
    if (value === null || value === undefined || value === '') return '—';
    return String(value);
  }

  openDetail(row: Row): void {
    this.detailRow.set(row);
  }

  closeDetail(): void {
    this.detailRow.set(null);
  }

  detailItems(): DetailItem[] {
    const row = this.detailRow();
    const fn = this.detail();
    if (!row || !fn) return [];
    return fn(row) ?? [];
  }

  detailTitle(): string {
    const row = this.detailRow();
    return row ? this.rowTitle(row) : '';
  }

  /* ===================== التصدير والطباعة ===================== */

  exportCsv(): void {
    const cols = this.columns();
    const rows = this.sorted();
    if (rows.length === 0) {
      this.toast.info('لا توجد بيانات', 'لا يوجد ما يمكن تصديره حالياً.');
      return;
    }
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const header = cols.map((c) => escape(c.label)).join(',');
    const lines = rows.map((row) => cols.map((c) => escape(this.cellText(c, row))).join(','));
    const csv = '\uFEFF' + [header, ...lines].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const name = this.config().exportName ?? this.config().entityPlural;
    link.href = url;
    link.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    this.toast.success('تم التصدير', `تم تصدير ${rows.length} سجل إلى ملف CSV.`);
  }

  print(): void {
    window.print();
  }
}
