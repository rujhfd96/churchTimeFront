import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ChurchService } from '../../../core/services/church.service';

@Component({
  selector: 'app-church-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 max-w-lg">
      <div class="flex items-center gap-3">
        <a routerLink="/churches" class="p-2 rounded-md hover:bg-accent text-muted-foreground transition-colors">
          <span class="material-icons text-xl">arrow_back</span>
        </a>
        <div>
          <h1 class="text-2xl font-bold text-foreground">{{ isEdit() ? 'Editar' : 'Nova' }} Igreja</h1>
          <p class="text-muted-foreground mt-1">{{ isEdit() ? 'Atualize os dados da igreja' : 'Cadastre uma nova igreja no sistema' }}</p>
        </div>
      </div>

      <div class="rounded-lg border border-border bg-card p-6">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-foreground mb-1.5 block">Nome da Igreja</label>
              <input
                type="text"
                formControlName="name"
                placeholder="Ex: Igreja Comunidade da Graça"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                [class.border-destructive]="name?.invalid && name?.touched"
              />
              @if (name?.invalid && name?.touched) {
                <p class="text-sm text-destructive mt-1">Nome é obrigatório</p>
              }
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
            <a routerLink="/churches" class="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors text-center">
              Cancelar
            </a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ChurchFormComponent {
  private fb = inject(FormBuilder);
  private churchService = inject(ChurchService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]]
  });

  loading = false;
  error = signal('');
  isEdit = signal(false);
  churchId: number | null = null;

  get name() { return this.form.get('name'); }

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.churchId = +id;
      this.churchService.getById(this.churchId).subscribe({
        next: (church) => this.form.patchValue({ name: church.name })
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error.set('');

    const body = { name: this.form.value.name! };
    const obs = this.isEdit()
      ? this.churchService.update(this.churchId!, body)
      : this.churchService.create(body);

    obs.subscribe({
      next: () => this.router.navigate(['/churches']),
      error: (err) => {
        this.loading = false;
        this.error.set(err.error?.message || 'Erro ao salvar igreja.');
      }
    });
  }
}
