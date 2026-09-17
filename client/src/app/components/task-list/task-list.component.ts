import { Component, inject, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskCardComponent } from '../task-card/task-card.component';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Task } from '../../models/task.model';
import { DueStatusPipe } from '../../shared/pipes/due-soon.pipe';
import { StatusColorDirective } from '../../shared/directives/status-color.directive';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskCardComponent, FormsModule, DueStatusPipe, StatusColorDirective, DragDropModule, MatSnackBarModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit, OnDestroy {
  @Input() statusColumn?: string;
  @Input() dotColor?: string;

  taskService = inject(TaskService);
  authService = inject(AuthService);
  snackBar = inject(MatSnackBar);
  cdr = inject(ChangeDetectorRef);

  tasks: Task[] = [];
  minDate = new Date().toISOString().split('T')[0];
  private sub?: Subscription;

  // ── Pagination ──────────────────────────────────────────────
  currentPage = 1;
  pageSize = 8;

  get paginatedTasks(): Task[] {
    if (this.statusColumn) return this.tasks;
    const start = (this.currentPage - 1) * this.pageSize;
    return this.tasks.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.tasks.length / this.pageSize) || 1;
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const cur = this.currentPage;
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (cur > 3) pages.push(-1);
      for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
      if (cur < total - 2) pages.push(-1);
      pages.push(total);
    }
    return pages;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  changePageSize(size: number) { this.pageSize = Number(size); this.currentPage = 1; }
  // ─────────────────────────────────────────────────────────────

  ngOnInit() {
    this.sub = this.taskService.tasks$.pipe(
      map(tasks => this.statusColumn ? tasks.filter(t => t.status === this.statusColumn) : tasks)
    ).subscribe(filteredTasks => {
      this.tasks = filteredTasks;
      this.currentPage = 1;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  showModal = false;
  editingTaskId: string | null = null;
  currentEditingTask: any = null;

  canEditTaskFields(task?: any): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;
    if (this.authService.isAdmin()) return true;
    if (!task) return true;
    return task.creator_id === user.id || (task.assignee_ids && task.assignee_ids.includes(user.id));
  }

  canDeleteTask(task: any): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;
    if (this.authService.isAdmin()) return true;
    return task?.creator_id === user.id;
  }

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
    this.currentEditingTask = null;
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
    this.currentEditingTask = task;

    let formattedDate = '';
    if (task.due_date) {
      const d = new Date(task.due_date);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toISOString().split('T')[0];
      }
    }

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

  isSaving = false;
  errorMessage = '';

  saveTask() {
    this.isSaving = true;
    this.errorMessage = '';

    const totalSubtasks = this.taskFormData.subtasks ? this.taskFormData.subtasks.length : 0;
    const completed = this.completedSubtasksCount;
    const pct = totalSubtasks === 0 ? 0 : Math.round((completed / totalSubtasks) * 100);

    this.taskFormData.progress_stats = `${completed}/${totalSubtasks} done · ${pct}%`;
    this.taskFormData.progress_bar_fill = pct;

    if (this.taskFormData.assignee_ids && this.taskFormData.assignee_ids.length > 0) {
      this.taskFormData.assignee_names = [];
      this.taskFormData.assignee_initials_list = [];
      for (const id of this.taskFormData.assignee_ids) {
        const user = this.taskService.users().find(u => u.id === id);
        if (user) {
          this.taskFormData.assignee_names.push(user.name);
          this.taskFormData.assignee_initials_list.push(
            user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
          );
        }
      }
    }

    const obs = this.editingTaskId
      ? this.taskService.updateTask(this.editingTaskId, this.taskFormData)
      : this.taskService.addTask(this.taskFormData);

    obs.subscribe({
      next: () => { this.isSaving = false; this.closeModal(); },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.error?.error || 'Failed to save task';
      }
    });
  }

  toggleAssignee(userId: string) {
    if (!this.taskFormData.assignee_ids) this.taskFormData.assignee_ids = [];
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

  closeModal() { this.showModal = false; }

  onDelete(id: string) {
    const snackBarRef = this.snackBar.open('Are you sure you want to delete this task?', 'Delete', {
      duration: 5000,
      panelClass: ['warn-snackbar']
    });

    snackBarRef.onAction().subscribe(() => {
      this.taskService.deleteTask(id).subscribe({
        next: () => this.snackBar.open('Task deleted successfully', 'Close', { duration: 3000 }),
        error: (err) => this.snackBar.open('Failed to delete task: ' + (err.error?.error || err.message), 'Close', { duration: 3000, panelClass: ['error-snackbar'] })
      });
    });
  }

  updateTaskStatus(task: Task, newStatus: string) {
    if (!this.canEditTaskFields(task)) {
      this.snackBar.open('You do not have permission to change the status of this task.', 'Close', {
        duration: 3000, panelClass: ['error-snackbar']
      });
      setTimeout(() => { this.cdr.detectChanges(); this.taskService.loadTasks(); });
      return;
    }

    if (newStatus && newStatus !== task.status) {
      if (newStatus === 'Testing' || newStatus === 'Completed') {
        const hasUncompletedSubtasks = task.subtasks && task.subtasks.some(st => !st.is_completed);
        if (hasUncompletedSubtasks) {
          this.snackBar.open(`Cannot move task to ${newStatus} because it has uncompleted subtasks.`, 'Close', {
            duration: 4000, panelClass: ['error-snackbar']
          });
          setTimeout(() => { this.cdr.detectChanges(); this.taskService.loadTasks(); });
          return;
        }
      }
      this.taskService.updateTask(task.id, { status: newStatus }).subscribe({
        error: (err) => console.error('Failed to update status', err)
      });
    }
  }

  onDrop(event: CdkDragDrop<any>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.item.data as Task;

      if (!this.canEditTaskFields(task)) {
        this.snackBar.open('You do not have permission to change the status of this task.', 'Close', {
          duration: 3000, panelClass: ['error-snackbar']
        });
        return;
      }

      if (this.statusColumn === 'Testing' || this.statusColumn === 'Completed') {
        const hasUncompletedSubtasks = task.subtasks && task.subtasks.some(st => !st.is_completed);
        if (hasUncompletedSubtasks) {
          this.snackBar.open(`Cannot move task to ${this.statusColumn} because it has uncompleted subtasks.`, 'Close', {
            duration: 4000, panelClass: ['error-snackbar']
          });
          return;
        }
      }

      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      if (this.statusColumn) {
        this.taskService.updateTask(task.id, { status: this.statusColumn }).subscribe({
          error: (err) => console.error('Failed to update status on drop', err)
        });
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
    if (!this.taskFormData.subtasks) this.taskFormData.subtasks = [];
    this.taskFormData.subtasks.push({
      id: 'sub_' + Math.random().toString(36).substr(2, 9),
      title: this.newSubtaskTitle.trim(),
      is_completed: false
    });
    this.newSubtaskTitle = '';
  }

  addComment() {
    if (!this.newCommentContent.trim()) return;
    if (!this.taskFormData.comments) this.taskFormData.comments = [];
    this.taskFormData.comments.push({
      id: 'cmt_' + Math.random().toString(36).substr(2, 9),
      user_id: this.authService.currentUser()?.id || '',
      content: this.newCommentContent.trim(),
      created_at: new Date().toISOString()
    });
    this.newCommentContent = '';
  }
}
