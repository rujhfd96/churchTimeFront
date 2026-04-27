import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (show()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="flex flex-col items-center gap-4">
          <div class="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          @if (message()) {
            <p class="text-sm font-medium text-muted-foreground">{{ message() }}</p>
          }
        </div>
      </div>
    }
  `
})
export class LoadingSpinnerComponent {
  show = input(false);
  message = input('Carregando...');
}
