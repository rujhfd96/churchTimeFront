import { Component, ChangeDetectionStrategy, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div class="w-full max-w-md mx-4 rounded-lg border border-border bg-card shadow-lg animate-scale-in">
        <div class="p-6">
          <h2 class="text-lg font-semibold text-foreground">{{ data().title }}</h2>
          <p class="text-sm text-muted-foreground mt-2">{{ data().message }}</p>
        </div>
        <div class="flex items-center justify-end gap-2 p-6 pt-0">
          <button
            (click)="onCancel()"
            class="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Cancelar
          </button>
          <button
            (click)="onConfirm()"
            class="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            {{ data().confirmText || 'Confirmar' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent {
  data = input.required<ConfirmDialogData>();
  confirm = output<void>();
  cancel = output<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
