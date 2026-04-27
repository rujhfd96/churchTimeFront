import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { EventResponse, EventStatus } from '../../../shared/models/event.models';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

const statusConfig: Record<EventStatus, { label: string; bg: string; text: string; icon: string }> = {
  SCHEDULED: { label: 'Agendado', bg: 'bg-blue-500/15', text: 'text-blue-500', icon: 'schedule' },
  OPEN: { label: 'Aberto', bg: 'bg-green-500/15', text: 'text-green-500', icon: 'door_open' },
  CLOSED: { label: 'Encerrado', bg: 'bg-muted', text: 'text-muted-foreground', icon: 'lock' }
};

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, RouterLink, DateFormatPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Eventos</h1>
          <p class="text-muted-foreground mt-1">Gerencie os eventos dos grupos</p>
        </div>
        <a routerLink="/events/new" class="inline-flex items-center gap-2 rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          <span class="material-icons text-lg">add</span>
          Novo Evento
        </a>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      } @else if (events().length === 0) {
        <div class="rounded-lg border border-border bg-card p-12 text-center">
          <span class="material-icons text-6xl text-muted-foreground">event</span>
          <p class="text-muted-foreground mt-4 font-medium">Nenhum evento cadastrado</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          @for (event of events(); track event.id) {
            <div class="rounded-lg border border-border bg-card p-6 transition-all duration-200 hover:shadow-md hover:border-primary/30">
              <div class="flex items-start justify-between mb-3">
                <a [routerLink]="['/events', event.id]" class="text-lg font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
                  {{ event.title }}
                </a>
                <span class="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ml-2 inline-flex items-center gap-1" [class]="statusConfig[event.status].bg + ' ' + statusConfig[event.status].text">
                  <span class="material-icons text-sm">{{ statusConfig[event.status].icon }}</span>
                  {{ statusConfig[event.status].label }}
                </span>
              </div>
              @if (event.location) {
                <div class="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span class="material-icons text-base flex-shrink-0">location_on</span>
                  <span class="truncate">{{ event.location }}</span>
                </div>
              }
              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <span class="material-icons text-base flex-shrink-0">schedule</span>
                {{ event.eventDate | dateFormat }}
              </div>
              <div class="mt-4 pt-4 border-t border-border flex items-center gap-2">
                <a [routerLink]="['/events', event.id]" class="text-sm font-medium text-primary hover:text-primary/80 transition-colors">Ver detalhes</a>
                <a [routerLink]="['/presence', 'event', event.id]" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Presenças</a>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class EventListComponent {
  private eventService = inject(EventService);
  events = signal<EventResponse[]>([]);
  loading = signal(false);
  statusConfig = statusConfig;

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.eventService.listByGroup(1).subscribe({
      next: (data) => {
        this.events.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
