import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskListComponent } from '../task-list/task-list.component';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, TaskListComponent, FormsModule],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  taskService = inject(TaskService);
  searchTerm = '';
  statusFilter = '';

  onSearchChange(term: string) {
    this.searchTerm = term;
    this.taskService.updateSearch(term);
  }

  onStatusChange(status: string) {
    this.statusFilter = status;
    this.taskService.updateStatus(status);
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
}
