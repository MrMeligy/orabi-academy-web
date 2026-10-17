import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { AcademyStore } from '../core/services/academy-store';
import { NAV_GROUPS, NAV_ITEMS, NavItem, itemsOfGroup } from './navigation';
import { Icon } from '../shared/ui/icon';
import { ToastHost } from '../shared/ui/toast-host';

/** الهيكل العام للنظام: شريط جانبي + شريط أعلى + منطقة المحتوى */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, ToastHost],
  templateUrl: './shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  private readonly router = inject(Router);
  readonly store = inject(AcademyStore);

  readonly groups = NAV_GROUPS;
  readonly sidebarOpen = signal(false);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly currentItem = computed<NavItem | undefined>(() => {
    const url = this.url();
    return NAV_ITEMS.find((item) => url.startsWith(item.path));
  });

  readonly today = new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  items(group: string): NavItem[] {
    return itemsOfGroup(group);
  }

  count(item: NavItem): number | null {
    if (!item.countKey) return null;
    return this.store.counts()[item.countKey];
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  refresh(): void {
    this.store.loadAll();
  }
}
