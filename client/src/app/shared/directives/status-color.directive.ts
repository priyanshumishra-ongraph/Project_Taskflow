import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

@Directive({
  selector: '[appStatusColor]',
  standalone: true
})
export class StatusColorDirective implements OnChanges {
  @Input('appStatusColor') status!: string;

  constructor(private el: ElementRef) {}

  ngOnChanges() {
    if (this.status) {
      // Map status to a subtle border-left or just default text instead of bold red
      this.el.nativeElement.style.color = '#1e293b'; // Default dark gray
      this.el.nativeElement.style.fontWeight = '600';
    }
  }
}
