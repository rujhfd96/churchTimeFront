import { Component, TemplateRef, ViewChild, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-popover-trigger',
  standalone: true,
  template: `
    <ng-content></ng-content>
    <ng-template #popoverContent>
      <div class="popover-content shadow-lg rounded-md border bg-background p-0 min-w-[auto]">
        <ng-content select="[popover-content]"></ng-content>
      </div>
    </ng-template>
  `
})
export class PopoverTriggerComponent {
  @ViewChild('popoverContent') popoverTemplate!: TemplateRef<any>;
  @Output() openPopover = new EventEmitter<TemplateRef<any>>();

  trigger(): void {
    this.openPopover.emit(this.popoverTemplate);
  }
}