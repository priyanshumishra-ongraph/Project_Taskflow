import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dueStatus',
  standalone: true
})
export class DueStatusPipe implements PipeTransform {
  transform(value: string | Date): 'passed' | 'soon' | null {
    if (!value) return null;
    
    const dueDate = new Date(value);
    dueDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'passed';
    } else if (diffDays >= 0 && diffDays <= 2) {
      return 'soon';
    }
    
    return null;
  }
}
