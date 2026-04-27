import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PresenceService } from '../../../core/services/presence.service';
import { PresenceResponse } from '../../../shared/models/presence.models';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-presence-list',
  standalone: true,
  imports: [CommonModule, RouterLink, DateFormatPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Presenças</h1>
          <p class="text-muted-foreground mt-1">Lista de check-ins do evento</p>
        </div>
        <a routerLink="/events" class="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors">
          Voltar
        </a>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      } @else if (presences().length === 0) {
        <div class="rounded-lg border border-border bg-card p-12 text-center">
          <span class="material-icons text-6xl text-muted-foreground">event_busy</span>
          <p class="text-muted-foreground mt-4 font-medium">Nenhuma presença registrada</p>
        </div>
      } @else {
        <div class="rounded-lg border border-border bg-card overflow-hidden">
          <div class="p-4 flex items-center justify-between border-b border-border">
            <span class="text-sm text-muted-foreground">Total de presenças</span>
            <span class="text-lg font-bold text-primary">{{ presences().length }}</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-border">
                  <th class="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3 w-12"></th>
                  <th class="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Nome</th>
                  <th class="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Check-in</th>
                  <th class="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                @for (presence of presences(); track presence.id) {
                  <tr class="hover:bg-muted/50 transition-colors">
                    <td class="px-6 py-4">
                      <div class="w-10 h-10 rounded-full bg-green-500/15 flex items-center justify-center text-green-500 text-sm font-semibold">
                        {{ presence.userName.charAt(0) }}
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span class="font-semibold text-foreground">{{ presence.userName }}</span>
                    </td>
                    <td class="px-6 py-4">
                      <span class="text-sm text-muted-foreground">{{ presence.checkedInAt | dateFormat }}</span>
                    </td>
                    <td class="px-6 py-4">
                      <span class="material-icons text-green-500">check_circle</span>
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
export class PresenceListComponent {
  private presenceService = inject(PresenceService);
  private route = inject(ActivatedRoute);
  presences = signal<PresenceResponse[]>([]);
  loading = signal(false);

  constructor() {
    this.load();
  }

  load(): void {
    const eventId = +this.route.snapshot.paramMap.get('eventId')!;
    this.loading.set(true);
    this.presenceService.listByEvent(eventId).subscribe({
      next: (data) => {
        this.presences.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
