import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div class="w-full max-w-md">
        <div class="rounded-xl border border-border bg-card p-8 shadow-lg">
          <div class="text-center mb-8">
            <div class="w-16 h-16 mx-auto rounded-2xl bg-primary flex items-center justify-center mb-4">
              <span class="material-icons text-primary-foreground text-4xl">lock_reset</span>
            </div>
            <h1 class="text-2xl font-bold text-foreground">Recuperar Senha</h1>
            <p class="text-muted-foreground mt-1">Informe seu e-mail para receber um código de 6 dígitos</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div>
              <label class="text-sm font-medium text-foreground mb-1.5 block">E-mail</label>
              <input
                type="email"
                formControlName="email"
                placeholder="seu@email.com"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                [class.border-destructive]="email?.invalid && email?.touched"
              />
              @if (email?.invalid && email?.touched) {
                <p class="text-sm text-destructive mt-1">
                  @if (email?.errors?.['required']) { E-mail é obrigatório }
                  @if (email?.errors?.['email']) { E-mail inválido }
                </p>
              }
            </div>

            @if (error()) {
              <div class="p-3 rounded-lg bg-destructive/10 border border-destructive/30 mt-4">
                <p class="text-sm text-destructive">{{ error() }}</p>
              </div>
            }

            @if (success()) {
              <div class="p-3 rounded-lg bg-green-500/10 border border-green-500/30 mt-4">
                <p class="text-sm text-green-500 font-medium">Código enviado! Verifique seu e-mail.</p>
              </div>
            }

            <button
              type="submit"
              [disabled]="loading || form.invalid"
              class="mt-6 w-full inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (loading) {
                <div class="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                Enviando...
              } @else {
                Enviar código
              }
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-muted-foreground">
            Lembrou a senha?
            <a routerLink="/login" class="text-primary hover:text-primary/80 font-semibold transition-colors">Voltar ao login</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  loading = false;
  error = signal('');
  success = signal(false);

  get email() { return this.form.get('email'); }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error.set('');

    this.authService.forgotPassword(this.form.value as any).subscribe({
      next: () => {
        this.loading = false;
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/reset-password']), 2000);
      },
      error: () => {
        this.loading = false;
        this.error.set('Erro ao enviar instruções. Tente novamente.');
      }
    });
  }
}
