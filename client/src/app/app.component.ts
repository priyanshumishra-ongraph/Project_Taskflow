import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TaskService } from './services/task.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TaskListComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'TaskFlow';
  taskService = inject(TaskService);

  ngOnInit() {
    this.taskService.loadTasks();
  }

  clearTasks() {
    this.taskService.tasks.set([]);
  }

  resetTasks() {
    this.taskService.loadTasks();
  }
}
