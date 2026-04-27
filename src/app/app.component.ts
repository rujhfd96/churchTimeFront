import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { HeaderComponent } from './shared/components/header/header.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent, LoadingSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isAuthPage()) {
      <router-outlet></router-outlet>
    } @else {
      <div class="flex h-screen bg-background overflow-hidden">
        @if (sidebarOpen()) {
          <div
            class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-fade-in"
            (click)="sidebarOpen.set(false)"
          ></div>
        }

        <aside
          class="fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col"
          [class.translate-x-0]="sidebarOpen()"
          [class.-translate-x-full]="!sidebarOpen()"
        >
          <app-sidebar (onClose)="sidebarOpen.set(false)"></app-sidebar>
        </aside>

        <div class="flex-1 flex flex-col min-w-0">
          <app-header (onToggleSidebar)="sidebarOpen.set(!sidebarOpen())"></app-header>
          <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin">
            <div class="max-w-7xl mx-auto animate-fade-in">
              <router-outlet></router-outlet>
            </div>
          </main>
        </div>
      </div>
    }
    <app-loading-spinner [show]="loading()" message="Carregando..."></app-loading-spinner>
  `
})
export class AppComponent {
  sidebarOpen = signal(false);
  loading = signal(false);

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.sidebarOpen.set(false);
    });
  }

  isAuthPage(): boolean {
    const url = this.router.url;
    return url === '/login' || url === '/register' || url === '/forgot-password' || url === '/reset-password' || url === '/password-reset-success';
  }
}
