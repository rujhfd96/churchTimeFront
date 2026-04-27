import { Component, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GroupService } from '../../../core/services/group.service';
import { GroupResponse } from '../../../shared/models/group.models';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [CommonModule, RouterLink, DateFormatPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-foreground">Grupos</h1>
            <p class="text-muted-foreground mt-1">Células, ministérios e grupos</p>
          </div>
          @if (canCreate()) {
            <a routerLink="/groups/new" class="inline-flex items-center gap-2 rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              <span class="material-icons text-lg">add</span>
              Novo Grupo
            </a>
          }
        </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      } @else if (groups().length === 0) {
        <div class="rounded-lg border border-border bg-card p-12 text-center">
          <span class="material-icons text-6xl text-muted-foreground">groups</span>
          <p class="text-muted-foreground mt-4 font-medium">Nenhum grupo cadastrado</p>
        </div>
      } @else {
        <div class="rounded-lg border border-border bg-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-border">
                  <th class="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Nome</th>
                  <th class="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Líder</th>
                  <th class="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Descrição</th>
                  <th class="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Status</th>
                  <th class="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                @for (group of groups(); track group.id) {
                  <tr class="hover:bg-muted/50 transition-colors">
                    <td class="px-4 py-3">
                      <a [routerLink]="['/groups', group.id]" class="font-semibold text-foreground hover:text-primary transition-colors">
                        {{ group.name }}
                      </a>
                    </td>
                    <td class="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                      {{ group.leaderName || '—' }}
                    </td>
                    <td class="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                      <span class="truncate block max-w-xs">{{ group.description || '—' }}</span>
                    </td>
                    <td class="px-4 py-3 hidden sm:table-cell">
                      <span class="text-xs px-2.5 py-1 rounded-full font-medium" [class]="group.active ? 'bg-green-500/15 text-green-500' : 'bg-muted text-muted-foreground'">
                        {{ group.active ? 'Ativo' : 'Inativo' }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <a [routerLink]="['/groups', group.id]" class="text-sm font-medium text-primary hover:text-primary/80 transition-colors">Ver</a>
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
export class GroupListComponent {
  private groupService = inject(GroupService);
  private authService = inject(AuthService);
  groups = signal<GroupResponse[]>([]);
  loading = signal(false);

  canCreate = computed(() => {
    const role = this.authService.getUserRole();
    return role === 'ADMIN' || role === 'LEADER';
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.groupService.listByChurch(1).subscribe({
      next: (data) => {
        this.groups.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
