import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Toast, ToastService } from '../../core/services/toast.service';
import { Icon, IconName } from './icon';

@Component({
  selector: 'app-toast-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div class="toast-host" aria-live="polite">
      @for (toast of toasts(); track toast.id) {
        <div [class]="'toast ' + toast.type" role="status">
          <div class="toast-ico">
            <app-icon [name]="icon(toast)" [size]="17" />
          </div>
          <div class="toast-body grow">
            <b>{{ toast.title }}</b>
            @if (toast.message) {
              <span>{{ toast.message }}</span>
            }
          </div>
          <button type="button" class="modal-close" (click)="dismiss(toast.id)" aria-label="إغلاق">
            <app-icon name="close" [size]="16" />
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastHost {
  private readonly service = inject(ToastService);
  readonly toasts = this.service.toasts;

  dismiss(id: number): void {
    this.service.dismiss(id);
  }

  icon(toast: Toast): IconName {
    switch (toast.type) {
      case 'success':
        return 'check';
      case 'error':
        return 'alert';
      case 'warn':
        return 'alert';
      default:
        return 'info';
    }
  }
}
