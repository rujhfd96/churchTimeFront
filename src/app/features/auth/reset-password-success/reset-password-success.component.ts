import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset-password-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div class="w-full max-w-md">
        <div class="rounded-xl border border-border bg-card p-8 shadow-lg text-center">
          <div class="w-20 h-20 mx-auto rounded-full bg-green-500/15 flex items-center justify-center mb-6 animate-scale-in">
            <span class="material-icons text-green-500 text-5xl">check_circle</span>
          </div>
          <h1 class="text-2xl font-bold text-foreground mb-2">Senha Redefinida!</h1>
          <p class="text-muted-foreground mb-8">Sua senha foi alterada com sucesso. Agora você já pode fazer login com a nova senha.</p>
          <a
            routerLink="/login"
            class="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-8 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <span class="material-icons text-lg mr-2">login</span>
            Fazer login
          </a>
        </div>
      </div>
    </div>
  `
})
export class ResetPasswordSuccessComponent {}
