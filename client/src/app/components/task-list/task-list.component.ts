import { Component, inject, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskCardComponent } from '../task-card/task-card.component';
import { TaskService } from '../../services/task.service';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Task } from '../../models/task.model';
import { DueStatusPipe } from '../../shared/pipes/due-soon.pipe';
import { StatusColorDirective } from '../../shared/directives/status-color.directive';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskCardComponent, FormsModule, DueStatusPipe, StatusColorDirective, DragDropModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit, OnDestroy {
  @Input() statusColumn?: string;
  @Input() dotColor?: string;

  taskService = inject(TaskService);
  cdr = inject(ChangeDetectorRef);
  tasks: Task[] = [];
  private sub?: Subscription;

  ngOnInit() {
    this.sub = this.taskService.tasks$.pipe(
      map(tasks => this.statusColumn ? tasks.filter(t => t.status === this.statusColumn) : tasks)
    ).subscribe(filteredTasks => {
      this.tasks = filteredTasks;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
  
  showModal = false;
  editingTaskId: string | null = null;
  
  taskFormData: any = {
    title: '',
    priority: 'Low',
    status: 'To Do',
    subtasks: [],
    comments: []
  };

  newSubtaskTitle = '';
  newCommentContent = '';

  openAddModal() {
    this.editingTaskId = null;
    this.taskFormData = { 
      title: '', 
      priority: 'Low', 
      status: 'To Do',
      subtasks: [],
      comments: []
    };
    this.newSubtaskTitle = '';
    this.newCommentContent = '';
    this.showModal = true;
  }
  
  openEditModal(task: any) {
    this.editingTaskId = task.id;
    
    let formattedDate = '';
    if (task.due_date) {
      const d = new Date(task.due_date);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toISOString().split('T')[0];
      }
    }

    // Deep clone to avoid mutating state before saving
    this.taskFormData = { 
      ...task,
      due_date: formattedDate,
      subtasks: task.subtasks ? task.subtasks.map((s: any) => ({ ...s })) : [],
      comments: task.comments ? task.comments.map((c: any) => ({ ...c })) : []
    };
    this.newSubtaskTitle = '';
    this.newCommentContent = '';
    this.showModal = true;
  }

  saveTask() {
    // Recalculate progress stats
    const totalSubtasks = this.taskFormData.subtasks ? this.taskFormData.subtasks.length : 0;
    const completed = this.completedSubtasksCount;
    const pct = totalSubtasks === 0 ? 0 : Math.round((completed / totalSubtasks) * 100);
    
    this.taskFormData.progress_stats = `${completed}/${totalSubtasks} done · ${pct}%`;
    this.taskFormData.progress_bar_fill = pct;
    
    // Resolve assignee details
    if (this.taskFormData.assignee_ids && this.taskFormData.assignee_ids.length > 0) {
      this.taskFormData.assignee_names = [];
      this.taskFormData.assignee_initials_list = [];
      for (const id of this.taskFormData.assignee_ids) {
        const user = this.taskService.users().find(u => u.id === id);
        if (user) {
          this.taskFormData.assignee_names.push(user.name);
          this.taskFormData.assignee_initials_list.push(user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase());
        }
      }
    }

    if (this.editingTaskId) {
      this.taskService.updateTask(this.editingTaskId, this.taskFormData);
    } else {
      this.taskService.addTask(this.taskFormData);
    }
    this.closeModal();
  }

  toggleAssignee(userId: string) {
    if (!this.taskFormData.assignee_ids) {
      this.taskFormData.assignee_ids = [];
    }
    const idx = this.taskFormData.assignee_ids.indexOf(userId);
    if (idx > -1) {
      this.taskFormData.assignee_ids.splice(idx, 1);
    } else {
      this.taskFormData.assignee_ids.push(userId);
    }
  }

  isAssigneeSelected(userId: string): boolean {
    return this.taskFormData.assignee_ids?.includes(userId);
  }


  closeModal() {
    this.showModal = false;
  }
  
  onDelete(id: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id);
    }
  }

  updateTaskStatus(task: Task, newStatus: string) {
    if (newStatus && newStatus !== task.status) {
      this.taskService.updateTask(task.id, { status: newStatus });
    }
  }

  onDrop(event: CdkDragDrop<any>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      const task = event.item.data as Task;
      if (this.statusColumn) {
        // The array is already mutated locally for instant UI update.
        // Now trigger the backend update.
        this.taskService.updateTask(task.id, { status: this.statusColumn });
      }
    }
  }

  getUserName(userId: string): string {
    const user = this.taskService.users().find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  }

  get completedSubtasksCount(): number {
    if (!this.taskFormData.subtasks) return 0;
    return this.taskFormData.subtasks.filter((s: any) => s.is_completed).length;
  }

  get subtasksPercentage(): number {
    if (!this.taskFormData.subtasks || this.taskFormData.subtasks.length === 0) return 0;
    return Math.round((this.completedSubtasksCount / this.taskFormData.subtasks.length) * 100);
  }

  addSubtask() {
    if (!this.newSubtaskTitle.trim()) return;
    
    if (!this.taskFormData.subtasks) {
      this.taskFormData.subtasks = [];
    }
    
    this.taskFormData.subtasks.push({
      id: 'sub_' + Math.random().toString(36).substr(2, 9),
      title: this.newSubtaskTitle.trim(),
      is_completed: false
    });
    
    this.newSubtaskTitle = '';
  }

  addComment() {
    if (!this.newCommentContent.trim()) return;
    
    if (!this.taskFormData.comments) {
      this.taskFormData.comments = [];
    }
    
    this.taskFormData.comments.push({
      id: 'cmt_' + Math.random().toString(36).substr(2, 9),
      user_id: 'usr_1', // Hardcode current user as John Doe for now
      content: this.newCommentContent.trim(),
      created_at: new Date().toISOString()
    });
    
    this.newCommentContent = '';
  }
}
