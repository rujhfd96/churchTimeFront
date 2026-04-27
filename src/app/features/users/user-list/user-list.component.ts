import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { UserResponse } from '../../../shared/models/user.models';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { RoleLabelPipe } from '../../../shared/pipes/role-label.pipe';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, DateFormatPipe, RoleLabelPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Usuários</h1>
          <p class="text-muted-foreground mt-1">Gerencie os membros cadastrados</p>
        </div>
        <a routerLink="/users/new" class="inline-flex items-center gap-2 rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          <span class="material-icons text-lg">add</span>
          Novo Usuário
        </a>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      } @else if (users().length === 0) {
        <div class="rounded-lg border border-border bg-card p-12 text-center">
          <span class="material-icons text-6xl text-muted-foreground">people</span>
          <p class="text-muted-foreground mt-4 font-medium">Nenhum usuário cadastrado</p>
        </div>
      } @else {
        <div class="rounded-lg border border-border bg-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-border">
                  <th class="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Nome</th>
                  <th class="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">E-mail</th>
                  <th class="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Grupo</th>
                  <th class="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Permissão</th>
                  <th class="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden xl:table-cell">Status</th>
                  <th class="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                @for (user of users(); track user.id) {
                  <tr class="hover:bg-muted/50 transition-colors">
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold flex-shrink-0">
                          {{ user.name.charAt(0) }}
                        </div>
                        <a [routerLink]="['/users', user.id]" class="font-semibold text-foreground hover:text-primary transition-colors">
                          {{ user.name }}
                        </a>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                      {{ user.email }}
                    </td>
                    <td class="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                      {{ user.groupName || '—' }}
                    </td>
                    <td class="px-4 py-3 hidden sm:table-cell">
                      <span class="text-xs px-2.5 py-1 rounded-full font-medium" [class]="roleBadgeClass(user.role)">
                        {{ user.role | roleLabel }}
                      </span>
                    </td>
                    <td class="px-4 py-3 hidden xl:table-cell">
                      <span class="text-xs px-2.5 py-1 rounded-full font-medium" [class]="user.active ? 'bg-green-500/15 text-green-500' : 'bg-muted text-muted-foreground'">
                        {{ user.active ? 'Ativo' : 'Inativo' }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <a [routerLink]="['/users', user.id]" class="text-sm font-medium text-primary hover:text-primary/80 transition-colors">Ver</a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `
})
export class UserListComponent {
  private userService = inject(UserService);
  users = signal<UserResponse[]>([]);
  loading = signal(false);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.userService.list().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  roleBadgeClass(role: string): string {
    const classes: Record<string, string> = {
      ADMIN: 'bg-primary/15 text-primary',
      LEADER: 'bg-primary/15 text-primary',
      MEMBER: 'bg-muted text-muted-foreground'
    };
    return classes[role] || 'bg-muted text-muted-foreground';
  }
}
