import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
import { DueStatusPipe } from '../../shared/pipes/due-soon.pipe';
import { StatusColorDirective } from '../../shared/directives/status-color.directive';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, DueStatusPipe, StatusColorDirective],
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.css']
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;
  
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  onEdit() {
    this.edit.emit();
  }

  onDelete() {
    this.delete.emit();
  }
}
