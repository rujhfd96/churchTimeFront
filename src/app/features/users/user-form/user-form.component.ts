import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { UserRole } from '../../../shared/models/user.models';

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'MEMBER', label: 'Membro' },
  { value: 'LEADER', label: 'Líder' },
  { value: 'ADMIN', label: 'Administrador' }
];

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 max-w-lg">
      <div class="flex items-center gap-3">
        <a routerLink="/users" class="p-2 rounded-md hover:bg-accent text-muted-foreground transition-colors">
          <span class="material-icons text-xl">arrow_back</span>
        </a>
        <div>
          <h1 class="text-2xl font-bold text-foreground">{{ isEdit() ? 'Editar' : 'Novo' }} Usuário</h1>
          <p class="text-muted-foreground mt-1">{{ isEdit() ? 'Atualize os dados do usuário' : 'Cadastre um novo membro' }}</p>
        </div>
      </div>

      <div class="rounded-lg border border-border bg-card p-6">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-foreground mb-1.5 block">Nome</label>
              <input
                type="text"
                formControlName="name"
                placeholder="Nome completo"
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
                placeholder="email@exemplo.com"
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

            @if (!isEdit()) {
              <div>
                <label class="text-sm font-medium text-foreground mb-1.5 block">Senha</label>
                <input
                  type="password"
                  formControlName="password"
                  placeholder="Mínimo 6 caracteres"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  [class.border-destructive]="password?.invalid && password?.touched"
                />
                @if (password?.invalid && password?.touched) {
                  <p class="text-sm text-destructive mt-1">Senha é obrigatória (mínimo 6 caracteres)</p>
                }
              </div>
            }

            <div>
              <label class="text-sm font-medium text-foreground mb-1.5 block">Permissão</label>
              <select
                formControlName="role"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                @for (opt of roleOptions; track opt.value) {
                  <option [value]="opt.value">{{ opt.label }}</option>
                }
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
              {{ loading ? 'Salvando...' : 'Salvar' }}
            </button>
            <a routerLink="/users" class="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors text-center">
              Cancelar
            </a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class UserFormComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', [Validators.minLength(6)]],
    role: ['MEMBER' as UserRole]
  });

  loading = false;
  error = signal('');
  isEdit = signal(false);
  userId: number | null = null;
  roleOptions = roleOptions;

  get name() { return this.form.get('name'); }
  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.userId = +id;
      this.userService.getById(this.userId).subscribe({
        next: (user) => this.form.patchValue({ name: user.name, email: user.email, phone: user.phone, role: user.role })
      });
    } else {
      this.password?.setValidators([Validators.required, Validators.minLength(6)]);
      this.password?.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error.set('');

    const { name, email, phone, role, password } = this.form.value;
    const body: any = { name: name!, email: email!, phone: phone || undefined, role: role! };
    if (password) body.password = password;

    const obs = this.isEdit()
      ? this.userService.update(this.userId!, body)
      : this.userService.create(body);

    obs.subscribe({
      next: () => this.router.navigate(['/users']),
      error: (err) => {
        this.loading = false;
        this.error.set(err.error?.message || 'Erro ao salvar usuário.');
      }
    });
  }
}
