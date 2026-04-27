import { Component, inject, signal, ChangeDetectionStrategy, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GroupService } from '../../../core/services/group.service';
import { GroupResponse } from '../../../shared/models/group.models';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DateFormatPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 max-w-2xl">
      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      } @else if (error()) {
        <div class="rounded-lg border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p class="text-red-500">{{ error() }}</p>
          <a routerLink="/groups" class="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 mt-3 border border-border bg-background hover:bg-accent transition-colors">Voltar para lista</a>
        </div>
      } @else {
        <ng-container>
          @if (group(); as g) {
            <div class="space-y-6">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 class="text-2xl font-bold text-foreground">{{ g.name }}</h1>
                  <p class="text-muted-foreground mt-1">Detalhes do grupo</p>
                </div>
                <div class="flex gap-2">
                  @if (canEdit()) {
                    <a [routerLink]="['/groups', g.id, 'users']" class="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors">Ver Membros</a>
                    <a [routerLink]="['/groups', g.id, 'edit']" class="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 border border-primary/30 text-primary hover:bg-primary/10 transition-colors">Editar</a>
                  }
                  <a routerLink="/groups" class="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors">Voltar</a>
                </div>
              </div>

              <div class="rounded-lg border border-border bg-card overflow-hidden">
                <div class="divide-y divide-border">
                  @if (g.description) {
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-1">
                      <span class="text-sm text-muted-foreground">Descrição</span>
                      <span class="text-sm text-foreground">{{ g.description }}</span>
                    </div>
                  }
                  <div class="flex items-center justify-between p-4">
                    <span class="text-sm text-muted-foreground">Líder</span>
                    <span class="text-sm font-semibold text-foreground">{{ g.leaderName || 'Não atribuído' }}</span>
                  </div>
                  <div class="flex items-center justify-between p-4">
                    <span class="text-sm text-muted-foreground">Status</span>
                    <span class="text-xs px-2.5 py-1 rounded-full font-medium" [class]="g.active ? 'bg-green-500/15 text-green-500' : 'bg-muted text-muted-foreground'">
                      {{ g.active ? 'Ativo' : 'Inativo' }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between p-4">
                    <span class="text-sm text-muted-foreground">Criado em</span>
                    <span class="text-sm font-semibold text-foreground">{{ g.createdAt | dateFormat }}</span>
                  </div>
                </div>
              </div>
            </div>
          }
        </ng-container>
      }
    </div>
  `
})
export class GroupDetailComponent implements OnInit {
  private groupService = inject(GroupService);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  group = signal<GroupResponse | null>(null);
  error = signal<string | null>(null);
  loading = signal(true);

  canEdit = computed(() => {
    const role = this.authService.getUserRole();
    return role === 'ADMIN' || role === 'LEADER';
  });

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.groupService.getById(id).subscribe({
      next: (data) => {
        this.group.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        if (err?.status === 403) {
          this.error.set('Você não tem permissão para visualizar este grupo.');
        } else if (err?.status === 404) {
          this.error.set('Grupo não encontrado.');
        } else {
          this.error.set('Erro ao carregar o grupo. Tente novamente.');
        }
        this.loading.set(false);
      }
    });
  }
}
