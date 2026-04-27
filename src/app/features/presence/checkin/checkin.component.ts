import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PresenceService } from '../../../core/services/presence.service';
import { PresenceResponse } from '../../../shared/models/presence.models';

@Component({
  selector: 'app-checkin',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 max-w-lg mx-auto">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-foreground">Check-in</h1>
        <p class="text-muted-foreground mt-1">Registre sua presença no evento</p>
      </div>

      <div class="rounded-lg border border-border bg-card p-8 text-center">
        @if (success()) {
          <div class="w-20 h-20 mx-auto rounded-full bg-green-500/15 flex items-center justify-center mb-6">
            <span class="material-icons text-green-500 text-5xl">check_circle</span>
          </div>
          <h2 class="text-xl font-bold text-foreground mb-2">Check-in Realizado!</h2>
          <p class="text-muted-foreground">Sua presença foi registrada com sucesso.</p>
          @if (presence(); as p) {
            <p class="text-sm text-muted-foreground mt-4">Registrado em {{ p.checkedInAt | date:'dd/MM/yyyy HH:mm' }}</p>
          }
        } @else if (error()) {
          <div class="w-20 h-20 mx-auto rounded-full bg-destructive/15 flex items-center justify-center mb-6">
            <span class="material-icons text-destructive text-5xl">error</span>
          </div>
          <h2 class="text-xl font-bold text-foreground mb-2">Erro no Check-in</h2>
          <p class="text-destructive">{{ error() }}</p>
        } @else {
          <div class="w-20 h-20 mx-auto rounded-full bg-primary/15 flex items-center justify-center mb-6">
            <span class="material-icons text-primary text-5xl">check_circle</span>
          </div>
          <h2 class="text-xl font-bold text-foreground mb-2">Pronto para Check-in</h2>
          <p class="text-muted-foreground mb-6">Clique no botão abaixo para registrar sua presença</p>
          <button
            (click)="doCheckIn()"
            [disabled]="loading()"
            class="inline-flex items-center justify-center rounded-md text-sm font-medium h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            @if (loading()) {
              <div class="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
              Registrando...
            } @else {
              Fazer Check-in
            }
          </button>
        }
      </div>
    </div>
  `
})
export class CheckinComponent {
  private presenceService = inject(PresenceService);
  private route = inject(ActivatedRoute);

  loading = signal(false);
  success = signal(false);
  error = signal('');
  presence = signal<PresenceResponse | null>(null);

  doCheckIn(): void {
    const eventId = +(this.route.snapshot.paramMap.get('eventId') || 0);
    if (!eventId) {
      this.error.set('Evento não identificado.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.presenceService.checkIn(eventId).subscribe({
      next: (data) => {
        this.loading.set(false);
        this.success.set(true);
        this.presence.set(data);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Erro ao realizar check-in.');
      }
    });
  }
}
