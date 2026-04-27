import { Component, ChangeDetectionStrategy, inject, signal, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sticky top-0 z-40 h-16 border-b border-border bg-background/80 backdrop-blur-md">
      <div class="flex items-center justify-between h-full px-4">
        <div class="flex items-center gap-3">
          <button
            (click)="toggleSidebar.emit()"
            class="lg:hidden p-2 rounded-md hover:bg-accent text-muted-foreground transition-colors"
          >
            <span class="material-icons text-xl">menu</span>
          </button>
          <div class="flex items-center gap-2">
            <span class="material-icons text-primary text-2xl">church</span>
            <span class="text-lg font-semibold hidden sm:inline">ChurchTime</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="hidden sm:flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
              {{ userInitial() }}
            </div>
            <span class="text-sm font-medium">{{ userName() }}</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
              {{ userRole() }}
            </span>
          </div>
          <div class="relative">
            <button
              (click)="menuOpen.set(!menuOpen())"
              class="p-2 rounded-md hover:bg-accent text-muted-foreground transition-colors"
            >
              <span class="material-icons text-xl">more_vert</span>
            </button>
            @if (menuOpen()) {
              <div
                class="absolute right-0 top-full mt-1 w-48 rounded-md border border-border bg-popover shadow-lg animate-scale-in z-50"
                (click)="menuOpen.set(false)"
              >
                <button
                  (click)="logout()"
                  class="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors rounded-md"
                >
                  <span class="material-icons text-base">logout</span>
                  <span>Sair</span>
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  private authService = inject(AuthService);

  menuOpen = signal(false);
  toggleSidebar = output<void>();

  userName(): string {
    const token = this.authService.getToken();
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.name || 'Usuário';
    } catch {
      return 'Usuário';
    }
  }

  userInitial(): string {
    return this.userName().charAt(0).toUpperCase();
  }

  userRole(): string {
    const role = this.authService.getUserRole();
    const labels: Record<string, string> = { ADMIN: 'Admin', LEADER: 'Líder', MEMBER: 'Membro' };
    return labels[role || ''] || role || '';
  }

  logout(): void {
    this.menuOpen.set(false);
    this.authService.logout();
  }
}
