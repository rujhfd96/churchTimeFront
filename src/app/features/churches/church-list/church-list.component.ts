import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChurchService } from '../../../core/services/church.service';
import { ChurchResponse } from '../../../shared/models/church.models';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-church-list',
  standalone: true,
  imports: [CommonModule, RouterLink, DateFormatPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Igrejas</h1>
          <p class="text-muted-foreground mt-1">Gerencie as igrejas cadastradas</p>
        </div>
        <a routerLink="/churches/new" class="inline-flex items-center gap-2 rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          <span class="material-icons text-lg">add</span>
          Nova Igreja
        </a>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      } @else if (churches().length === 0) {
        <div class="rounded-lg border border-border bg-card p-12 text-center">
          <span class="material-icons text-6xl text-muted-foreground">church</span>
          <p class="text-muted-foreground mt-4 font-medium">Nenhuma igreja cadastrada</p>
          <a routerLink="/churches/new" class="inline-flex items-center gap-2 mt-4 text-sm font-medium text-primary hover:text-primary/80 transition-colors">Cadastrar primeira igreja</a>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          @for (church of churches(); track church.id) {
            <div class="rounded-lg border border-border bg-card p-6 transition-all duration-200 hover:shadow-md hover:border-primary/30">
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <a [routerLink]="['/churches', church.id]" class="text-lg font-semibold text-foreground hover:text-primary transition-colors truncate block">
                    {{ church.name }}
                  </a>
                  <p class="text-sm text-muted-foreground mt-1">Criada em {{ church.createdAt | dateFormat }}</p>
                </div>
                <span class="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ml-2" [class]="church.active ? 'bg-green-500/15 text-green-500' : 'bg-muted text-muted-foreground'">
                  {{ church.active ? 'Ativa' : 'Inativa' }}
                </span>
              </div>
              <div class="mt-4 pt-4 border-t border-border flex items-center gap-2">
                <a [routerLink]="['/churches', church.id]" class="text-sm font-medium text-primary hover:text-primary/80 transition-colors">Ver detalhes</a>
                <a [routerLink]="['/churches', church.id, 'edit']" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Editar</a>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ChurchListComponent {
  private churchService = inject(ChurchService);
  churches = signal<ChurchResponse[]>([]);
  loading = signal(false);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.churchService.list().subscribe({
      next: (data) => {
        this.churches.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
