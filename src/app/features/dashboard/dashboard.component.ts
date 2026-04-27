import { Component, inject, signal, ChangeDetectionStrategy, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { MyGroupInfo } from '../../shared/models/dashboard.models';
import { UserResponse } from '../../shared/models/user.models';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Olá, {{ userName() }}! 👋</h1>
        <p class="text-muted-foreground mt-1">Visão geral do seu grupo</p>
      </div>

      @if (userGroup()) {
        <div class="rounded-2xl border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 via-green-500/5 to-background p-6 shadow-lg relative overflow-hidden">
          <div class="absolute top-0 right-0 w-48 h-48 bg-green-500/5 rounded-full -translate-y-24 translate-x-24"></div>
          <div class="absolute bottom-0 left-0 w-32 h-32 bg-green-500/5 rounded-full translate-y-16 -translate-x-16"></div>
          <div class="relative flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center shadow-inner">
              <span class="material-icons text-3xl text-green-500">groups</span>
            </div>
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full inline-block">Seu Grupo</p>
              <h2 class="text-xl font-bold text-foreground mt-1">{{ userGroup() }}</h2>
            </div>
          </div>
        </div>
      }

      @if (myGroup() && !myGroupLoading()) {
        <div class="rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 shadow-lg relative overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div class="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full translate-y-24 -translate-x-24"></div>

          <div class="relative">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center shadow-inner">
                  <span class="material-icons text-3xl text-primary">groups</span>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">{{ isLeader() ? 'Líder' : 'Membro' }}</span>
                  </div>
                  <h2 class="text-2xl font-bold text-foreground mt-1">{{ myGroup()!.name }}</h2>
                  @if (myGroup()!.description) {
                    <p class="text-sm text-muted-foreground mt-1">{{ myGroup()!.description }}</p>
                  }
                </div>
              </div>
              @if (isLeader()) {
                <div class="flex gap-2">
                  <a [routerLink]="['/groups', myGroup()!.id, 'users']" class="inline-flex items-center gap-2 rounded-lg text-sm font-medium h-10 px-4 py-2 bg-primary/15 text-primary hover:bg-primary/25 transition-colors">
                    <span class="material-icons text-lg">people</span>
                    Membros
                  </a>
                  <a [routerLink]="['/groups', myGroup()!.id]" class="inline-flex items-center gap-2 rounded-lg text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md">
                    Ver detalhes
                    <span class="material-icons text-lg">arrow_forward</span>
                  </a>
                </div>
              }
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div class="rounded-xl bg-background/80 backdrop-blur-sm p-5 text-center border border-border/50 hover:border-primary/30 transition-colors">
                <div class="flex items-center justify-center gap-2 mb-1">
                  <span class="material-icons text-lg text-primary">people</span>
                  <p class="text-3xl font-bold text-foreground">{{ myGroup()!.memberCount }}</p>
                </div>
                <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Membros</p>
              </div>
              <div class="rounded-xl bg-background/80 backdrop-blur-sm p-5 text-center border border-border/50 hover:border-green-500/30 transition-colors">
                <div class="flex items-center justify-center gap-2 mb-1">
                  <span class="material-icons text-lg text-green-500">event</span>
                  <p class="text-3xl font-bold text-green-500">{{ myGroup()!.activeEvents }}</p>
                </div>
                <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Eventos Ativos</p>
              </div>
              <div class="rounded-xl bg-background/80 backdrop-blur-sm p-5 text-center border border-border/50 hover:border-primary/30 transition-colors">
                <div class="flex items-center justify-center gap-2 mb-1">
                  <span class="material-icons text-lg text-primary">shield_person</span>
                </div>
                <p class="text-sm font-bold text-foreground">{{ myGroup()!.leaderName || 'Sem líder' }}</p>
                <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Líder</p>
              </div>
              <div class="rounded-xl bg-background/80 backdrop-blur-sm p-5 text-center border border-border/50 hover:border-primary/30 transition-colors">
                <div class="flex items-center justify-center mb-1">
                  <span class="text-xs px-3 py-1.5 rounded-full font-bold" [class]="myGroup()!.active ? 'bg-green-500/15 text-green-500' : 'bg-muted text-muted-foreground'">
                    {{ myGroup()!.active ? 'Ativo' : 'Inativo' }}
                  </span>
                </div>
                <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Status</p>
              </div>
            </div>
          </div>
        </div>
      } @else if (myGroupError()) {
        <div class="rounded-2xl border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 p-8">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <span class="material-icons text-3xl text-yellow-500">warning</span>
            </div>
            <div>
              <h3 class="text-lg font-bold text-foreground">Nenhum grupo atribuído</h3>
              <p class="text-sm text-muted-foreground mt-1">Procure um administrador para ser vinculado a um grupo e gerenciar seus membros.</p>
            </div>
          </div>
        </div>
      }

      @if (noGroup()) {
        <div class="rounded-2xl border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 p-8 shadow-lg relative overflow-hidden">
          <div class="absolute top-0 right-0 w-48 h-48 bg-yellow-500/5 rounded-full -translate-y-24 translate-x-24"></div>
          <div class="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/5 rounded-full translate-y-16 -translate-x-16"></div>
          <div class="relative flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-yellow-500/20 flex items-center justify-center shadow-inner">
              <span class="material-icons text-3xl text-yellow-500">groups</span>
            </div>
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full inline-block">Sem Grupo</p>
              <h2 class="text-xl font-bold text-foreground mt-1">{{ noGroupName() }}</h2>
              <p class="text-sm text-muted-foreground mt-1">Você ainda não está associado a um grupo.</p>
            </div>
          </div>
        </div>
      }

      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          @for (_ of [1,2,3,4]; track _) {
            <div class="rounded-lg border border-border bg-card p-6 animate-pulse">
              <div class="flex items-center justify-between">
                <div class="space-y-2">
                  <div class="h-4 w-24 bg-muted rounded"></div>
                  <div class="h-8 w-16 bg-muted rounded"></div>
                </div>
                <div class="w-12 h-12 rounded-xl bg-muted"></div>
              </div>
              <div class="h-3 w-32 bg-muted rounded mt-3"></div>
            </div>
          }
        </div>
      } @else if (error()) {
        <div class="rounded-lg border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p class="text-red-500">{{ error() }}</p>
          <button (click)="loadStats()" class="mt-3 text-sm text-primary hover:underline">Tentar novamente</button>
        </div>
      } @else if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          @for (_ of [1,2,3,4]; track _) {
            <div class="rounded-lg border border-border bg-card p-6 animate-pulse">
              <div class="flex items-center justify-between">
                <div class="space-y-2">
                  <div class="h-4 w-24 bg-muted rounded"></div>
                  <div class="h-8 w-16 bg-muted rounded"></div>
                </div>
                <div class="w-12 h-12 rounded-xl bg-muted"></div>
              </div>
              <div class="h-3 w-32 bg-muted rounded mt-3"></div>
            </div>
          }
        </div>
      } @else if (error()) {
        <div class="rounded-lg border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p class="text-red-500">{{ error() }}</p>
          <button (click)="loadStats()" class="mt-3 text-sm text-primary hover:underline">Tentar novamente</button>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          @for (card of cards(); track card.label) {
            <div class="rounded-lg border border-border bg-card p-6 transition-all duration-200 hover:shadow-md hover:border-primary/30">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-muted-foreground">{{ card.label }}</p>
                  <p class="text-3xl font-bold mt-1 text-foreground">{{ card.value }}</p>
                </div>
                <div class="w-12 h-12 rounded-xl flex items-center justify-center" [class]="card.bgClass">
                  <span class="material-icons">{{ card.icon }}</span>
                </div>
              </div>
              <p class="text-xs text-muted-foreground mt-3">{{ card.footer }}</p>
            </div>
          }
        </div>
      }

      @if (!loading() && !error() && !noGroup()) {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="rounded-lg border border-border bg-card p-6">
            <h2 class="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h2>
            <div class="grid grid-cols-2 gap-3">
              @if (canCreateEvent) {
                <a routerLink="/events" class="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  <span class="material-icons text-2xl">event</span>
                  <span class="text-sm font-medium">Novo Evento</span>
                </a>
              }
              <a routerLink="/groups" class="flex flex-col items-center gap-2 p-4 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors">
                <span class="material-icons text-2xl">groups</span>
                <span class="text-sm font-medium">Ver Grupos</span>
              </a>
              @if (isLeader()) {
                <a [routerLink]="['/groups', myGroup()?.id, 'users']" class="flex flex-col items-center gap-2 p-4 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors">
                  <span class="material-icons text-2xl">people</span>
                  <span class="text-sm font-medium">Meus Membros</span>
                </a>
              } @else if (canViewUsers) {
                <a routerLink="/users" class="flex flex-col items-center gap-2 p-4 rounded-lg border border-border text-foreground hover:bg-accent transition-colors">
                  <span class="material-icons text-2xl">people</span>
                  <span class="text-sm font-medium">Usuários</span>
                </a>
              }
              <a routerLink="/presence/checkin" class="flex flex-col items-center gap-2 p-4 rounded-lg border border-border text-foreground hover:bg-accent transition-colors">
                <span class="material-icons text-2xl">check_circle</span>
                <span class="text-sm font-medium">Check-in</span>
              </a>
            </div>
          </div>

          <div class="rounded-lg border border-border bg-card p-6">
            <h2 class="text-lg font-semibold text-foreground mb-4">Bem-vindo ao ChurchTime!</h2>
            <div class="space-y-3">
              <div class="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <span class="material-icons text-primary mt-0.5">info</span>
                <div>
                  <p class="text-sm font-medium text-foreground">Gerencie seus grupos</p>
                  <p class="text-xs text-muted-foreground">Crie células, ministérios e organize membros</p>
                </div>
              </div>
              <div class="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <span class="material-icons text-primary mt-0.5">event</span>
                <div>
                  <p class="text-sm font-medium text-foreground">Crie eventos</p>
                  <p class="text-xs text-muted-foreground">Agende cultos, reuniões e acompanhe presenças</p>
                </div>
              </div>
              <div class="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <span class="material-icons text-green-500 mt-0.5">check_circle</span>
                <div>
                  <p class="text-sm font-medium text-foreground">Check-in fácil</p>
                  <p class="text-xs text-muted-foreground">Membros fazem check-in em eventos abertos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  loading = signal(true);
  error = signal<string | null>(null);
  noGroup = signal(false);
  noGroupName = signal('');
  noGroupMembers = signal(0);

  myGroupLoading = signal(true);
  myGroupError = signal(false);
  myGroup = signal<MyGroupInfo | null>(null);
  isLeader = signal(false);

  userName = signal<string>('');
  userGroup = signal<string | null>(null);

  get canCreateEvent(): boolean {
    const role = this.authService.getUserRole();
    return role === 'ADMIN' || role === 'LEADER';
  }
  get canViewUsers(): boolean {
    return this.authService.getUserRole() === 'ADMIN';
  }

  cards = signal([
    {
      label: 'Total de Grupos',
      value: '0',
      footer: 'Células e ministérios',
      icon: 'groups',
      bgClass: 'bg-primary/15 text-primary'
    },
    {
      label: 'Eventos Abertos',
      value: '0',
      footer: 'Prontos para check-in',
      icon: 'event',
      bgClass: 'bg-green-500/15 text-green-500'
    },
    {
      label: 'Membros Ativos',
      value: '0',
      footer: 'Cadastrados no sistema',
      icon: 'people',
      bgClass: 'bg-primary/15 text-primary'
    },
    {
      label: 'Presenças Hoje',
      value: '0',
      footer: 'Check-ins realizados',
      icon: 'check_circle',
      bgClass: 'bg-yellow-500/15 text-yellow-500'
    }
  ]);

  ngOnInit() {
    this.isLeader.set(this.authService.getUserRole() === 'LEADER');
    this.loadUserData();
    this.loadStats();
    this.loadMyGroup();
  }

  loadUserData() {
    this.userName.set(this.authService.getUserName() || 'Usuário');

    const userId = this.authService.getUserId();
    if (userId) {
      this.userService.getById(userId)
        .pipe(
          catchError(() => of(null))
        )
        .subscribe((user: UserResponse | null) => {
          if (user?.groupName) {
            this.userGroup.set(user.groupName);
          }
        });
    }
  }

  loadStats() {
    this.loading.set(true);
    this.error.set(null);

    this.dashboardService.getStats()
      .pipe(
        catchError((err) => {
          this.error.set(err?.status === 401
            ? 'Sessão expirada. Faça login novamente.'
            : 'Erro ao carregar estatísticas. Tente novamente.');
          this.loading.set(false);
          return of(null);
        })
      )
      .subscribe((stats) => {
        if (stats) {
          if (stats.message && stats.message.includes('sem grupo')) {
            this.noGroup.set(true);
            this.noGroupName.set(stats.test?.name || '');
            this.noGroupMembers.set(stats.test?.members || 0);
            this.loading.set(false);
            return;
          }
          this.cards.set([
            {
              label: 'Total de Grupos',
              value: (stats.totalGroups ?? 0).toString(),
              footer: 'Células e ministérios',
              icon: 'groups',
              bgClass: 'bg-primary/15 text-primary'
            },
            {
              label: 'Eventos Abertos',
              value: (stats.openEvents ?? 0).toString(),
              footer: 'Prontos para check-in',
              icon: 'event',
              bgClass: 'bg-green-500/15 text-green-500'
            },
            {
              label: 'Membros Ativos',
              value: (stats.activeMembers ?? 0).toString(),
              footer: 'Cadastrados no sistema',
              icon: 'people',
              bgClass: 'bg-primary/15 text-primary'
            },
            {
              label: 'Presenças Hoje',
              value: (stats.todayCheckins ?? 0).toString(),
              footer: 'Check-ins realizados',
              icon: 'check_circle',
              bgClass: 'bg-yellow-500/15 text-yellow-500'
            }
          ]);
        }
        this.loading.set(false);
      });
  }

  loadMyGroup() {
    this.dashboardService.getMyGroup()
      .pipe(
        catchError(() => {
          this.myGroupLoading.set(false);
          this.myGroupError.set(true);
          return of(null);
        })
      )
      .subscribe((group) => {
        if (group) {
          this.myGroup.set(group);
        }
        this.myGroupLoading.set(false);
      });
  }
}
