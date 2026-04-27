import { Component, ChangeDetectionStrategy, inject, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="flex flex-col h-full py-4">
      <div class="flex-1 space-y-1 px-3">
        @for (item of navItems(); track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="bg-primary/15 text-primary"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="close.emit()"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200 group"
          >
            <span class="material-icons text-xl group-[.bg-primary\/15]:text-primary">{{ item.icon }}</span>
            <span class="text-sm font-medium">{{ item.label }}</span>
          </a>
        }
      </div>

      <div class="px-3 mt-4">
        <div class="rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 p-4">
          <p class="text-sm font-semibold text-foreground">ChurchTime</p>
          <p class="text-xs text-muted-foreground mt-1">Gerencie sua igreja com facilidade</p>
        </div>
      </div>
    </nav>
  `
})
export class SidebarComponent {
  private authService = inject(AuthService);

  close = output<void>();

  userRole = computed(() => this.authService.getUserRole());

  navItems = computed<NavItem[]>(() => {
    const role = this.userRole();
    const allItems: NavItem[] = [
      { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
      { label: 'Igrejas', path: '/churches', icon: 'church', roles: ['ADMIN'] },
      { label: 'Grupos', path: '/groups', icon: 'groups', roles: ['ADMIN', 'LEADER', 'MEMBER'] },
      { label: 'Usuários', path: '/users', icon: 'people', roles: ['ADMIN'] },
      { label: 'Eventos', path: '/events', icon: 'event', roles: ['ADMIN', 'LEADER'] },
      { label: 'Check-in', path: '/presence/checkin', icon: 'check_circle' }
    ];

    if (!role) return [];
    if (role === 'ADMIN') return allItems;
    return allItems.filter(item => !item.roles || item.roles.includes(role));
  });
}
