import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
import { DueStatusPipe } from '../../shared/pipes/due-soon.pipe';
import { StatusColorDirective } from '../../shared/directives/status-color.directive';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, DueStatusPipe, StatusColorDirective, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatDividerModule],
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
