import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roleLabel',
  standalone: true
})
export class RoleLabelPipe implements PipeTransform {
  transform(value: string): string {
    const labels: Record<string, string> = {
      ADMIN: 'Administrador',
      LEADER: 'Líder',
      MEMBER: 'Membro'
    };
    return labels[value] || value;
  }
}
