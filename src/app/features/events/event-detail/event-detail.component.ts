import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';
import { EventResponse, EventStatus } from '../../../shared/models/event.models';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

const statusConfig: Record<EventStatus, { label: string; bg: string; text: string }> = {
  SCHEDULED: { label: 'Agendado', bg: 'bg-blue-500/15', text: 'text-blue-500' },
  OPEN: { label: 'Aberto', bg: 'bg-green-500/15', text: 'text-green-500' },
  CLOSED: { label: 'Encerrado', bg: 'bg-muted', text: 'text-muted-foreground' }
};

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DateFormatPipe, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 max-w-2xl">
      @if (event(); as e) {
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-foreground">{{ e.title }}</h1>
            <p class="text-muted-foreground mt-1">Detalhes do evento</p>
          </div>
          <div class="flex gap-2">
            @if (canDelete()) {
              <button (click)="openDeleteDialog(e)" class="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 border border-border bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors">
                <span class="material-icons text-sm mr-1.5">delete</span>
                Excluir
              </button>
            }
            <a [routerLink]="['/events', e.id, 'edit']" class="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors">
              <span class="material-icons text-sm mr-1.5">edit</span>
              Editar
            </a>
            <a routerLink="/events" class="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors">
              Voltar
            </a>
          </div>
        </div>

        <div class="rounded-lg border border-border bg-card overflow-hidden">
          <div class="divide-y divide-border">
            <div class="flex items-center justify-between p-4">
              <span class="text-sm text-muted-foreground">Status</span>
              <span class="text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1" [class]="statusConfig[e.status].bg + ' ' + statusConfig[e.status].text">
                {{ statusConfig[e.status].label }}
              </span>
            </div>
            @if (e.location) {
              <div class="flex items-center justify-between p-4">
                <span class="text-sm text-muted-foreground">Local</span>
                <span class="font-semibold text-foreground">{{ e.location }}</span>
              </div>
            }
            <div class="flex items-center justify-between p-4">
              <span class="text-sm text-muted-foreground">Data e Hora</span>
              <span class="font-semibold text-foreground">{{ e.eventDate | dateFormat }}</span>
            </div>
            <div class="flex items-center justify-between p-4">
              <span class="text-sm text-muted-foreground">Criado em</span>
              <span class="font-semibold text-foreground">{{ e.createdAt | dateFormat }}</span>
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-border bg-card p-6">
          <div class="flex items-start justify-between gap-4 flex-col md:flex-row">
            <div class="flex-1">
              <h2 class="text-lg font-semibold text-foreground">QR Code de presença</h2>
              <p class="text-sm text-muted-foreground mt-1">
                Compartilhe este QR com os membros para eles acessarem a tela de apontamento.
              </p>

              <div class="mt-4 rounded-md border border-border bg-background p-3 break-all text-sm text-foreground">
                {{ getPointingUrl(e.id) }}
              </div>

              <button
                (click)="copyLink(e.id)"
                class="mt-3 inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <span class="material-icons text-sm mr-1.5">content_copy</span>
                Copiar link
              </button>

              @if (copied()) {
                <p class="text-sm text-green-600 mt-2">Link copiado com sucesso.</p>
              }
            </div>

            <div class="rounded-lg border border-border bg-white p-4 self-center">
              <img
                [src]="getQrUrl(e.id)"
                alt="QR Code do evento"
                class="w-52 h-52 object-contain"
              />
            </div>
          </div>
        </div>

        <a [routerLink]="['/presence', 'event', e.id]" class="block rounded-lg border border-border bg-card p-6 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-green-500/15 flex items-center justify-center group-hover:bg-green-500/25 transition-colors">
              <span class="material-icons text-green-500">check_circle</span>
            </div>
            <div>
              <p class="font-semibold text-foreground group-hover:text-primary transition-colors">Ver Presenças</p>
              <p class="text-sm text-muted-foreground">Lista de check-ins deste evento</p>
            </div>
          </div>
        </a>
      } @else {
        <div class="flex justify-center py-12">
          <div class="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
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
export class EventDetailComponent {
  private eventService = inject(EventService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  event = signal<EventResponse | null>(null);
  statusConfig = statusConfig;
  confirmDialog = signal<ConfirmDialogData | null>(null);
  copied = signal(false);

  canDelete = computed(() => {
    const role = this.authService.getUserRole();
    return role === 'ADMIN' || role === 'LEADER';
  });

  constructor() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.eventService.getById(id).subscribe({
      next: (data) => this.event.set(data)
    });
  }

  getPointingUrl(eventId: number): string {
    return `${window.location.origin}/pointing/${eventId}`;
  }

  getQrUrl(eventId: number): string {
    const url = encodeURIComponent(this.getPointingUrl(eventId));
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${url}`;
  }

  async copyLink(eventId: number): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.getPointingUrl(eventId));
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2500);
    } catch {
      this.copied.set(false);
    }
  }

  openDeleteDialog(event: EventResponse): void {
    this.confirmDialog.set({
      title: 'Excluir Evento',
      message: `Tem certeza que deseja excluir o evento "${event.title}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir'
    });
  }

  confirmDelete(): void {
    const event = this.event();
    if (!event) return;

    this.eventService.delete(event.id).subscribe({
      next: () => {
        this.closeDialog();
        this.router.navigate(['/events']);
      },
      error: () => {
        this.closeDialog();
      }
    });
  }

  closeDialog(): void {
    this.confirmDialog.set(null);
  }
}