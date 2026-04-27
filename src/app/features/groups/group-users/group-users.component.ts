import { Component, inject, signal, ChangeDetectionStrategy, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { UserResponse } from '../../../shared/models/user.models';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { RoleLabelPipe } from '../../../shared/pipes/role-label.pipe';
import { AuthService } from '../../../core/services/auth.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-group-users',
  standalone: true,
  imports: [CommonModule, RouterLink, DateFormatPipe, RoleLabelPipe, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Membros do Grupo</h1>
          <p class="text-muted-foreground mt-1">{{ groupName() }}</p>
        </div>
        <a routerLink="/groups" class="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors">
          Voltar
        </a>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      } @else if (error()) {
        <div class="rounded-lg border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p class="text-red-500">{{ error() }}</p>
          <a routerLink="/groups" class="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 mt-3 border border-border bg-background hover:bg-accent transition-colors">Voltar para lista</a>
        </div>
      } @else if (users().length === 0) {
        <div class="rounded-lg border border-border bg-card p-12 text-center">
          <span class="material-icons text-6xl text-muted-foreground">people</span>
          <p class="text-muted-foreground mt-4 font-medium">Nenhum membro neste grupo</p>
        </div>
      } @else {
        <div class="rounded-lg border border-border bg-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-border">
                  <th class="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Nome</th>
                  <th class="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">E-mail</th>
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
                        <span class="font-semibold text-foreground">{{ user.name }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                      {{ user.email }}
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
                      @if (canDelete()) {
                        <button
                          (click)="openDeleteDialog(user)"
                          class="text-sm font-medium text-destructive hover:text-destructive/80 transition-colors"
                        >
                          Remover
                        </button>
                      } @else {
                        <span class="text-sm text-muted-foreground">—</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      @if (confirmDialog()) {
        <app-confirm-dialog
          [data]="confirmDialog()!"
          (confirm)="confirmDelete()"
          (cancel)="closeDialog()"
        />
      }
    </div>
  `
})
export class GroupUsersComponent implements OnInit {
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  users = signal<UserResponse[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  groupName = signal('');
  confirmDialog = signal<ConfirmDialogData | null>(null);
  userToDelete = signal<UserResponse | null>(null);

  canDelete = computed(() => {
    const role = this.authService.getUserRole();
    return role === 'ADMIN' || role === 'LEADER';
  });

  private groupId!: number;

  ngOnInit() {
    this.groupId = +this.route.snapshot.paramMap.get('id')!;
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.error.set(null);
    this.userService.listByGroup(this.groupId).subscribe({
      next: (data) => {
        this.users.set(data);
        if (data.length > 0 && data[0].groupName) {
          this.groupName.set(data[0].groupName);
        } else {
          this.groupName.set(`Grupo #${this.groupId}`);
        }
        this.loading.set(false);
      },
      error: (err) => {
        if (err?.status === 403) {
          this.error.set('Você não tem permissão para visualizar os membros deste grupo.');
        } else if (err?.status === 404) {
          this.error.set('Grupo não encontrado.');
        } else {
          this.error.set('Erro ao carregar membros. Tente novamente.');
        }
        this.loading.set(false);
      }
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

  openDeleteDialog(user: UserResponse) {
    this.userToDelete.set(user);
    this.confirmDialog.set({
      title: 'Remover membro',
      message: `Tem certeza que deseja remover "${user.name}" do grupo? Esta ação não pode ser desfeita.`,
      confirmText: 'Remover'
    });
  }

  confirmDelete() {
    const user = this.userToDelete();
    if (!user) return;

    this.userService.removeFromGroup(this.groupId, user.id).subscribe({
      next: () => {
        this.users.update(users => users.filter(u => u.id !== user.id));
        this.closeDialog();
      },
      error: (err) => {
        const msg = err?.error?.message || 'Erro ao remover membro. Tente novamente.';
        this.error.set(msg);
        this.closeDialog();
      }
    });
  }

  closeDialog() {
    this.confirmDialog.set(null);
    this.userToDelete.set(null);
  }
}
