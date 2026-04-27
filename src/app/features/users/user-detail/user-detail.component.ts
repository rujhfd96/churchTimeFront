import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { UserResponse } from '../../../shared/models/user.models';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { RoleLabelPipe } from '../../../shared/pipes/role-label.pipe';

const roleBadgeClass: Record<string, string> = {
  ADMIN: 'bg-primary/15 text-primary',
  LEADER: 'bg-blue-500/15 text-blue-500',
  MEMBER: 'bg-muted text-muted-foreground'
};

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DateFormatPipe, RoleLabelPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 max-w-2xl">
      @if (user(); as u) {
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center text-primary text-xl font-bold">
              {{ u.name.charAt(0) }}
            </div>
            <div>
              <h1 class="text-2xl font-bold text-foreground">{{ u.name }}</h1>
              <p class="text-muted-foreground mt-0.5">{{ u.email }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <a [routerLink]="['/users', u.id, 'edit']" class="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors">
              <span class="material-icons text-sm mr-1.5">edit</span>
              Editar
            </a>
            <a routerLink="/users" class="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors">
              Voltar
            </a>
          </div>
        </div>

        <div class="rounded-lg border border-border bg-card overflow-hidden">
          <div class="divide-y divide-border">
            <div class="flex items-center justify-between p-4">
              <span class="text-sm text-muted-foreground">Telefone</span>
              <span class="font-semibold text-foreground">{{ u.phone || 'Não informado' }}</span>
            </div>
            <div class="flex items-center justify-between p-4">
              <span class="text-sm text-muted-foreground">Permissão</span>
              <span class="text-xs px-2.5 py-1 rounded-full font-medium" [class]="roleBadgeClass[u.role]">{{ u.role | roleLabel }}</span>
            </div>
            <div class="flex items-center justify-between p-4">
              <span class="text-sm text-muted-foreground">Grupo</span>
              <span class="font-semibold text-foreground">{{ u.groupName || 'Não atribuído' }}</span>
            </div>
            <div class="flex items-center justify-between p-4">
              <span class="text-sm text-muted-foreground">Status</span>
              <span class="text-xs px-2.5 py-1 rounded-full font-medium" [class]="u.active ? 'bg-green-500/15 text-green-500' : 'bg-muted text-muted-foreground'">
                {{ u.active ? 'Ativo' : 'Inativo' }}
              </span>
            </div>
            <div class="flex items-center justify-between p-4">
              <span class="text-sm text-muted-foreground">Cadastrado em</span>
              <span class="font-semibold text-foreground">{{ u.createdAt | dateFormat }}</span>
            </div>
          </div>
        </div>
      } @else {
        <div class="flex justify-center py-12">
          <div class="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      }
    </div>
  `
})
export class UserDetailComponent {
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  user = signal<UserResponse | null>(null);
  roleBadgeClass = roleBadgeClass;

  constructor() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.userService.getById(id).subscribe({
      next: (data) => this.user.set(data)
    });
  }
}
