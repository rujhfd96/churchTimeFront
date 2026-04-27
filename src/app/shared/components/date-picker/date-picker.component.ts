import { Component, signal, computed, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    }
  ],
  template: `
    <div class="w-full">
      <label class="text-sm font-medium text-foreground mb-1.5 block">Data</label>
      <div class="relative">
        <button
          type="button"
          (click)="toggle()"
          class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span>{{ selectedDate() ? formatDate(selectedDate()!) : 'Selecione uma data' }}</span>
          <span class="material-icons text-muted-foreground">calendar_today</span>
        </button>
        
        @if (isOpen()) {
          <div class="absolute z-50 mt-1 w-72 rounded-lg border bg-background p-3 shadow-lg">
            <div class="flex items-center justify-between mb-2">
              <button type="button" (click)="prevMonth()" class="p-1 rounded hover:bg-accent">
                <span class="material-icons text-sm">chevron_left</span>
              </button>
              <span class="text-sm font-medium">{{ currentMonthName() }} {{ currentYear() }}</span>
              <button type="button" (click)="nextMonth()" class="p-1 rounded hover:bg-accent">
                <span class="material-icons text-sm">chevron_right</span>
              </button>
            </div>
            
            <div class="grid grid-cols-7 gap-1 text-center text-xs mb-1">
              @for (day of weekDays; track day) {
                <span class="text-muted-foreground p-1">{{ day }}</span>
              }
            </div>
            
            <div class="grid grid-cols-7 gap-1">
              @for (day of calendarDays(); track $index) {
                <button
                  type="button"
                  (click)="selectDate(day)"
                  [disabled]="!day"
                  class="h-8 w-8 rounded-md text-sm hover:bg-accent disabled:opacity-30"
                  [class.bg-primary]="isSelected(day)"
                  [class.text-primary-foreground]="isSelected(day)"
                >
                  {{ day }}
                </button>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class DatePickerComponent implements ControlValueAccessor {
  weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  currentMonth = signal(new Date().getMonth());
  currentYear = signal(new Date().getFullYear());
  selectedDate = signal<Date | null>(null);
  isOpen = signal(false);

  currentMonthName = computed(() => {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return months[this.currentMonth()];
  });

  calendarDays = computed(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    
    return days;
  });

  private onChange: any;
  private onTouched: any;

  toggle(): void {
    this.isOpen.update(v => !v);
  }

  prevMonth(): void {
    if (this.currentMonth() === 0) {
      this.currentMonth.set(11);
      this.currentYear.update(y => y - 1);
    } else {
      this.currentMonth.update(m => m - 1);
    }
  }

  nextMonth(): void {
    if (this.currentMonth() === 11) {
      this.currentMonth.set(0);
      this.currentYear.update(y => y + 1);
    } else {
      this.currentMonth.update(m => m + 1);
    }
  }

  selectDate(day: number | null): void {
    if (!day) return;
    const newDate = new Date(this.currentYear(), this.currentMonth(), day);
    this.selectedDate.set(newDate);
    this.isOpen.set(false);
    if (this.onChange) {
      this.onChange(newDate);
    }
    if (this.onTouched) {
      this.onTouched();
    }
  }

  isSelected(day: number | null): boolean {
    if (!day || !this.selectedDate()) return false;
    const selected = this.selectedDate()!;
    return selected.getDate() === day && 
           selected.getMonth() === this.currentMonth() && 
           selected.getFullYear() === this.currentYear();
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('pt-BR');
  }

  writeValue(value: Date | null): void {
    if (value) {
      this.selectedDate.set(value);
      this.currentMonth.set(value.getMonth());
      this.currentYear.set(value.getFullYear());
    } else {
      this.selectedDate.set(null);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}