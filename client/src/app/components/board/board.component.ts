import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskListComponent } from '../task-list/task-list.component';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, TaskListComponent],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  taskService = inject(TaskService);

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
