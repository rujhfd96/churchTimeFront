import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div class="w-full max-w-md">
        <div class="rounded-xl border border-border bg-card p-8 shadow-lg">
          <div class="text-center mb-8">
            <div class="w-16 h-16 mx-auto rounded-2xl bg-primary flex items-center justify-center mb-4">
              <span class="material-icons text-primary-foreground text-4xl">key</span>
            </div>
            <h1 class="text-2xl font-bold text-foreground">Redefinir Senha</h1>
            <p class="text-muted-foreground mt-1">Digite o código de 6 dígitos e crie uma nova senha</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="space-y-4">
              <div>
                <label class="text-sm font-medium text-foreground mb-1.5 block">Código de recuperação</label>
                <input
                  type="text"
                  formControlName="token"
                  maxlength="6"
                  inputmode="numeric"
                  placeholder="000000"
                  class="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-center text-2xl font-bold tracking-widest ring-offset-background placeholder:text-muted-foreground placeholder:text-sm placeholder:tracking-normal placeholder:font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  [class.border-destructive]="token?.invalid && token?.touched"
                />
                @if (token?.invalid && token?.touched) {
                  <p class="text-sm text-destructive mt-1">Código deve ter 6 dígitos numéricos</p>
                }
              </div>

              <div>
                <label class="text-sm font-medium text-foreground mb-1.5 block">Nova senha</label>
                <div class="relative">
                  <input
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="newPassword"
                    placeholder="Mínimo 6 caracteres"
                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    [class.border-destructive]="newPassword?.invalid && newPassword?.touched"
                  />
                  <button
                    type="button"
                    (click)="showPassword.set(!showPassword())"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span class="material-icons text-lg">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>
                @if (newPassword?.invalid && newPassword?.touched) {
                  <p class="text-sm text-destructive mt-1">Senha deve ter no mínimo 6 caracteres</p>
                }
              </div>

              <div>
                <label class="text-sm font-medium text-foreground mb-1.5 block">Confirmar nova senha</label>
                <input
                  [type]="showConfirmPassword() ? 'text' : 'password'"
                  formControlName="confirmPassword"
                  placeholder="Repita a senha"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  [class.border-destructive]="passwordMismatch()"
                />
                @if (passwordMismatch()) {
                  <p class="text-sm text-destructive mt-1">As senhas não coincidem</p>
                }
              </div>
            </div>

            @if (error()) {
              <div class="p-3 rounded-lg bg-destructive/10 border border-destructive/30 mt-4">
                <p class="text-sm text-destructive">{{ error() }}</p>
              </div>
            }

            <button
              type="submit"
              [disabled]="loading || form.invalid || passwordMismatch()"
              class="mt-6 w-full inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (loading) {
                <div class="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                Redefinindo...
              } @else {
                Redefinir senha
              }
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-muted-foreground">
            Não recebeu o código?
            <a routerLink="/forgot-password" class="text-primary hover:text-primary/80 font-semibold transition-colors">Reenviar</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    token: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  loading = false;
  error = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  get token() { return this.form.get('token'); }
  get newPassword() { return this.form.get('newPassword'); }

  passwordMismatch(): boolean {
    const pw = this.form.get('newPassword')?.value;
    const confirm = this.form.get('confirmPassword')?.value;
    return !!(pw && confirm && pw !== confirm);
  }

  onSubmit(): void {
    if (this.form.invalid || this.passwordMismatch()) return;
    this.loading = true;
    this.error.set('');

    const { token, newPassword } = this.form.value;
    this.authService.resetPassword({ token: token!, newPassword: newPassword! }).subscribe({
      next: () => this.router.navigate(['/password-reset-success']),
      error: (err) => {
        this.loading = false;
        this.error.set(err.error?.message || 'Código inválido ou expirado.');
      }
    });
  }
}
