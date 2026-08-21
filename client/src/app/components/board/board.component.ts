import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TaskListComponent } from '../task-list/task-list.component';
import { TaskService } from '../../services/task.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule, TaskListComponent, FormsModule, DragDropModule,
    MatFormFieldModule, MatSelectModule, MatInputModule, MatIconModule, MatButtonModule, MatButtonToggleModule, MatProgressSpinnerModule
  ],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  taskService = inject(TaskService);
  searchTerm = '';
  statusFilter = '';
  assigneeFilter = '';
  priorityFilter = '';
  viewMode: 'list' | 'board' = 'board';

  @ViewChild(TaskListComponent) firstTaskList!: TaskListComponent;

  onSearchChange(term: string) {
    this.searchTerm = term;
    this.taskService.updateSearch(term);
  }

  onStatusChange(status: string) {
    this.statusFilter = status;
    this.taskService.updateStatus(status);
  }

  onAssigneeChange(assigneeId: string) {
    this.assigneeFilter = assigneeId;
    this.taskService.updateAssignee(assigneeId);
  }

  onPriorityChange(priority: string) {
    this.priorityFilter = priority;
    this.taskService.updatePriority(priority);
  }

  ngOnInit() {
    this.taskService.loadTasks();
  }

  clearTasks() {
    this.taskService.clearTasks();
  }

  resetTasks() {
    this.taskService.loadTasks();
  }

  openNewTask() {
    if (this.firstTaskList) {
      this.firstTaskList.openAddModal();
    }
  }
}
