import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warn';

export interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

/** تنبيهات عائمة (Toasts) بنصوص عربية */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();
  private seq = 0;

  show(type: ToastType, title: string, message?: string, duration = 4200): number {
    const id = ++this.seq;
    this._toasts.update((list) => [...list, { id, type, title, message }]);
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
    return id;
  }

  success(title: string, message?: string) {
    return this.show('success', title, message);
  }

  error(title: string, message?: string) {
    return this.show('error', title, message, 6000);
  }

  info(title: string, message?: string) {
    return this.show('info', title, message);
  }

  warn(title: string, message?: string) {
    return this.show('warn', title, message);
  }

  dismiss(id: number) {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  clear() {
    this._toasts.set([]);
  }
}
