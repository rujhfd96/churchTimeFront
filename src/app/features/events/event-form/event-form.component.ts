import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { EventStatus } from '../../../shared/models/event.models';
import { DatePickerComponent } from '../../../shared/components/date-picker/date-picker.component';

@Component({
  selector: 'app-time-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full">
      <label class="text-sm font-medium text-foreground mb-1.5 block">Horário</label>
      <div class="flex items-center gap-1">
        <select
          [value]="hour()"
          (change)="setHour($event)"
          class="flex h-10 w-16 rounded-md border border-input bg-background px-2 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          @for (h of hours; track h) {
            <option [value]="h">{{ h.toString().padStart(2, '0') }}</option>
          }
        </select>
        <span class="text-muted-foreground">:</span>
        <select
          [value]="minute()"
          (change)="setMinute($event)"
          class="flex h-10 w-16 rounded-md border border-input bg-background px-2 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          @for (m of minutes; track m) {
            <option [value]="m">{{ m.toString().padStart(2, '0') }}</option>
          }
        </select>
      </div>
    </div>
  `
})
export class TimePickerComponent implements ControlValueAccessor {
  hours = Array.from({ length: 24 }, (_, i) => i);
  minutes = [0, 15, 30, 45];
  
  hour = signal(0);
  minute = signal(0);

  private onChange: any;
  private onTouched: any;

  setHour(event: Event): void {
    const value = +(event.target as HTMLSelectElement).value;
    this.hour.set(value);
    this.notifyChange();
  }

  setMinute(event: Event): void {
    const value = +(event.target as HTMLSelectElement).value;
    this.minute.set(value);
    this.notifyChange();
  }

  private notifyChange(): void {
    if (this.onChange) {
      this.onChange({ hour: this.hour(), minute: this.minute() });
    }
  }

  writeValue(value: { hour: number; minute: number } | null): void {
    if (value) {
      this.hour.set(value.hour);
      this.minute.set(value.minute);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, DatePickerComponent, TimePickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 max-w-lg">
      <div class="flex items-center gap-3">
        <a routerLink="/events" class="p-2 rounded-md hover:bg-accent text-muted-foreground transition-colors">
          <span class="material-icons text-xl">arrow_back</span>
        </a>
        <div>
          <h1 class="text-2xl font-bold text-foreground">{{ isEdit() ? 'Editar' : 'Novo' }} Evento</h1>
          <p class="text-muted-foreground mt-1">{{ isEdit() ? 'Atualize os dados do evento' : 'Crie um novo evento para seu grupo' }}</p>
        </div>
      </div>

      <div class="rounded-lg border border-border bg-card p-6">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-foreground mb-1.5 block">Título</label>
              <input
                type="text"
                formControlName="title"
                placeholder="Ex: Culto de Domingo"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                [class.border-destructive]="title?.invalid && title?.touched"
              />
              @if (title?.invalid && title?.touched) {
                <p class="text-sm text-destructive mt-1">Título é obrigatório (mínimo 3 caracteres)</p>
              }
            </div>

            <div>
              <label class="text-sm font-medium text-foreground mb-1.5 block">Local</label>
              <input
                type="text"
                formControlName="location"
                placeholder="Ex: Templo principal"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <app-date-picker formControlName="eventDate"></app-date-picker>
              <app-time-picker formControlName="eventTime"></app-time-picker>
            </div>

            <div>
              <label class="text-sm font-medium text-foreground mb-1.5 block">Status</label>
              <select
                formControlName="status"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="SCHEDULED">Agendado</option>
                <option value="OPEN">Aberto para check-in</option>
                <option value="CLOSED">Encerrado</option>
              </select>
            </div>
          </div>

          @if (error()) {
            <div class="p-3 rounded-lg bg-destructive/10 border border-destructive/30 mt-4">
              <p class="text-sm text-destructive">{{ error() }}</p>
            </div>
          }

          <div class="flex gap-3 mt-6">
            <button
              type="submit"
              [disabled]="loading || form.invalid"
              class="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (loading) {
                <div class="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
              }
              {{ loading ? 'Salvando...' : 'Salvar' }}
            </button>
            <a routerLink="/events" class="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors text-center">
              Cancelar
            </a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class EventFormComponent {
  private fb = inject(FormBuilder);
  private eventService = inject(EventService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    location: [''],
    eventDate: [null as Date | null, [Validators.required]],
    eventTime: [{ hour: 0, minute: 0 }],
    status: ['SCHEDULED' as EventStatus]
  });

  loading = false;
  error = signal('');
  isEdit = signal(false);
  eventId: number | null = null;

  get title() { return this.form.get('title'); }
  get eventDate() { return this.form.get('eventDate'); }

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.eventId = +id;
      this.eventService.getById(this.eventId).subscribe({
        next: (event) => {
          const date = new Date(event.eventDate);
          this.form.patchValue({
            title: event.title,
            location: event.location,
            eventDate: date,
            eventTime: { hour: date.getHours(), minute: date.getMinutes() },
            status: event.status
          });
        }
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error.set('');

    const { title, location, eventDate, eventTime, status } = this.form.value;
    
    const dateObj = eventDate as Date;
    const timeObj = eventTime as { hour: number; minute: number };
    
    const finalDate = new Date(
      dateObj.getFullYear(),
      dateObj.getMonth(),
      dateObj.getDate(),
      timeObj.hour,
      timeObj.minute
    );
    
    const body = { 
      title: title!, 
      location: location || undefined, 
      eventDate: finalDate.toISOString(), 
      status: status as EventStatus 
    };
    
    const obs = this.isEdit()
      ? this.eventService.update(this.eventId!, body)
      : this.eventService.create(1, body);

    obs.subscribe({
      next: () => this.router.navigate(['/events']),
      error: (err) => {
        this.loading = false;
        this.error.set(err.error?.message || 'Erro ao salvar evento.');
      }
    });
  }
}