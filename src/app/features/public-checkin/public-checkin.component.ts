import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { PresenceService } from '../../core/services/presence.service';
@Component({
  selector: 'app-public-checkin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div class="w-full max-w-md">
        <div class="rounded-xl border border-border bg-card p-8 shadow-lg">
          <div class="text-center mb-8">
            <div class="w-16 h-16 mx-auto rounded-2xl bg-primary flex items-center justify-center mb-4">
              <span class="material-icons text-primary-foreground text-4xl">qr_code_scanner</span>
            </div>
            <h1 class="text-2xl font-bold text-foreground">Apontar Presença</h1>
            <p class="text-muted-foreground mt-1">
              Faça login para registrar sua presença no evento
            </p>
          </div>

          @if (success()) {
            <div class="rounded-lg border border-green-500/30 bg-green-500/10 p-5 text-center">
              <div class="w-20 h-20 mx-auto rounded-full bg-green-500/15 flex items-center justify-center mb-4">
                <span class="material-icons text-green-500 text-5xl">check_circle</span>
              </div>
              <h2 class="text-xl font-bold text-foreground mb-2">Presença registrada!</h2>
              <p class="text-muted-foreground">
                Seu check-in foi realizado com sucesso.
              </p>

              @if (checkedInAt()) {
                <p class="text-sm text-muted-foreground mt-3">
                  Horário: {{ checkedInAt() | date:'dd/MM/yyyy HH:mm' }}
                </p>
              }

              <a
                routerLink="/dashboard"
                class="mt-5 inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Ir para o sistema
              </a>
            </div>
          } @else {
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="space-y-4">
                <div>
                  <label class="text-sm font-medium text-foreground mb-1.5 block">E-mail</label>
                  <input
                    type="email"
                    formControlName="email"
                    placeholder="seu@email.com"
                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    [class.border-destructive]="email?.invalid && email?.touched"
                  />
                  @if (email?.invalid && email?.touched) {
                    <p class="text-sm text-destructive mt-1">
                      @if (email?.errors?.['required']) { E-mail é obrigatório }
                      @if (email?.errors?.['email']) { E-mail inválido }
                    </p>
                  }
                </div>

                <div>
                  <label class="text-sm font-medium text-foreground mb-1.5 block">Senha</label>
                  <div class="relative">
                    <input
                      [type]="showPassword() ? 'text' : 'password'"
                      formControlName="password"
                      placeholder="••••••••"
                      class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      [class.border-destructive]="password?.invalid && password?.touched"
                    />
                    <button
                      type="button"
                      (click)="showPassword.set(!showPassword())"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <span class="material-icons text-lg">
                        {{ showPassword() ? 'visibility_off' : 'visibility' }}
                      </span>
                    </button>
                  </div>

                  @if (password?.invalid && password?.touched) {
                    <p class="text-sm text-destructive mt-1">
                      Senha é obrigatória (mínimo 6 caracteres)
                    </p>
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
                [disabled]="loading() || form.invalid"
                class="mt-6 w-full inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                @if (loading()) {
                  <div class="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                  Registrando presença...
                } @else {
                  Entrar e apontar presença
                }
              </button>
            </form>
          }
        </div>
      </div>
    </div>
  `
})
export class PublicCheckinComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private presenceService = inject(PresenceService);
  private route = inject(ActivatedRoute);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loading = signal(false);
  error = signal('');
  success = signal(false);
  checkedInAt = signal<string | null>(null);
  showPassword = signal(false);

  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }

  onSubmit(): void {
    if (this.form.invalid) return;

    const eventId = +(this.route.snapshot.paramMap.get('eventId') || 0);
    if (!eventId) {
      this.error.set('Evento não identificado.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.login(this.form.getRawValue() as { email: string; password: string })
      .pipe(
        switchMap(() => this.presenceService.checkIn(eventId))
      )
      .subscribe({
        next: (presence) => {
          this.loading.set(false);
          this.success.set(true);
          this.checkedInAt.set(presence.checkedInAt);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(
            err?.error?.message ||
            'Não foi possível registrar sua presença.'
          );
        }
      });
  }
}