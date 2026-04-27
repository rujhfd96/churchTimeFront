import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div class="w-full max-w-md">
        <div class="rounded-xl border border-border bg-card p-8 shadow-lg">
          <div class="text-center mb-8">
            <div class="w-16 h-16 mx-auto rounded-2xl bg-primary flex items-center justify-center mb-4">
              <span class="material-icons text-primary-foreground text-4xl">person_add</span>
            </div>
            <h1 class="text-2xl font-bold text-foreground">Criar Conta</h1>
            <p class="text-muted-foreground mt-1">Junte-se ao ChurchTime</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="space-y-4">
              <div>
                <label class="text-sm font-medium text-foreground mb-1.5 block">Nome</label>
                <input
                  type="text"
                  formControlName="name"
                  placeholder="Seu nome completo"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  [class.border-destructive]="name?.invalid && name?.touched"
                />
                @if (name?.invalid && name?.touched) {
                  <p class="text-sm text-destructive mt-1">Nome é obrigatório (mínimo 3 caracteres)</p>
                }
              </div>

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
                  <p class="text-sm text-destructive mt-1">E-mail inválido</p>
                }
              </div>

              <div>
                <label class="text-sm font-medium text-foreground mb-1.5 block">Telefone</label>
                <input
                  type="tel"
                  formControlName="phone"
                  placeholder="(11) 99999-9999"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div>
                <label class="text-sm font-medium text-foreground mb-1.5 block">Senha</label>
                <div class="relative">
                  <input
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="password"
                    placeholder="Mínimo 6 caracteres"
                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    [class.border-destructive]="password?.invalid && password?.touched"
                  />
                  <button
                    type="button"
                    (click)="showPassword.set(!showPassword())"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span class="material-icons text-lg">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>
                @if (password?.invalid && password?.touched) {
                  <p class="text-sm text-destructive mt-1">Senha é obrigatória (mínimo 6 caracteres)</p>
                }
              </div>

              <div>
                <label class="text-sm font-medium text-foreground mb-1.5 block">Confirmar Senha</label>
                <input
                  type="password"
                  formControlName="confirmPassword"
                  placeholder="Repita a senha"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                Criando conta...
              } @else {
                Criar Conta
              }
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta?
            <a routerLink="/login" class="text-primary hover:text-primary/80 font-semibold transition-colors">Fazer login</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  loading = false;
  error = signal('');
  showPassword = signal(false);

  get name() { return this.form.get('name'); }
  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }

  passwordMismatch(): boolean {
    const p = this.form.get('password')?.value;
    const c = this.form.get('confirmPassword')?.value;
    return !!(p && c && p !== c);
  }

  onSubmit(): void {
    if (this.form.invalid || this.passwordMismatch()) return;
    this.loading = true;
    this.error.set('');

    const { confirmPassword, ...data } = this.form.value;
    this.authService.register(data as any).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loading = false;
        this.error.set(err.error?.message || 'Erro ao criar conta.');
      }
    });
  }
}
