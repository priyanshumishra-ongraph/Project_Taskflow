import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  private fb = inject(FormBuilder);
  public taskService = inject(TaskService);
  public projectService = inject(ProjectService);
  public authService = inject(AuthService);
  private router = inject(Router);

  taskForm: FormGroup;
  projectForm: FormGroup;
  successMessage = '';
  projectSuccessMessage = '';

  activeTab: 'dashboard' | 'users' | 'projects' | 'assign' = 'dashboard';
  usersList: any[] = [];
  private http = inject(HttpClient);

  constructor() {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      project_id: ['', Validators.required],
      assignee_ids: [[]],
      subtasks: [[]],
      comments: [[]],
      priority: ['Medium'],
      status: ['To Do'],
      due_date: ['']
    });

    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      owner_id: ['']
    });
  }

  ngOnInit(): void {
    // Ensure projects are loaded
    this.projectService.loadProjects();
    this.loadUsers();
  }

  loadUsers() {
    this.http.get<{data: any[]}>(`${environment.apiUrl}/auth/users`).subscribe({
      next: (res) => this.usersList = res.data,
      error: (err) => console.error("Failed to load users", err)
    });
  }

  getUserName(userId: string): string {
    const user = this.usersList.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  }

  isAssigneeSelected(userId: string): boolean {
    const current = this.taskForm.get('assignee_ids')?.value || [];
    return current.includes(userId);
  }

  toggleAssignee(userId: string) {
    const current = [...(this.taskForm.get('assignee_ids')?.value || [])];
    const index = current.indexOf(userId);
    if (index === -1) {
      current.push(userId);
    } else {
      current.splice(index, 1);
    }
    this.taskForm.patchValue({ assignee_ids: current });
  }

  newSubtaskTitle = '';
  newCommentContent = '';

  get completedSubtasksCount(): number {
    const subtasks = this.taskForm.get('subtasks')?.value || [];
    return subtasks.filter((s: any) => s.is_completed).length;
  }

  get subtasksPercentage(): number {
    const subtasks = this.taskForm.get('subtasks')?.value || [];
    if (subtasks.length === 0) return 0;
    return Math.round((this.completedSubtasksCount / subtasks.length) * 100);
  }

  addSubtask() {
    if (!this.newSubtaskTitle.trim()) return;
    const current = [...(this.taskForm.get('subtasks')?.value || [])];
    current.push({
      id: 'sub_' + Math.random().toString(36).substr(2, 9),
      title: this.newSubtaskTitle.trim(),
      is_completed: false
    });
    this.taskForm.patchValue({ subtasks: current });
    this.newSubtaskTitle = '';
  }

  toggleSubtask(id: string) {
    const current = [...(this.taskForm.get('subtasks')?.value || [])];
    const subtask = current.find(s => s.id === id);
    if (subtask) {
      subtask.is_completed = !subtask.is_completed;
      this.taskForm.patchValue({ subtasks: current });
    }
  }

  addComment() {
    if (!this.newCommentContent.trim()) return;
    const current = [...(this.taskForm.get('comments')?.value || [])];
    const currentUser = this.authService.currentUser();
    current.push({
      id: 'cmt_' + Math.random().toString(36).substr(2, 9),
      user_id: currentUser ? currentUser.id : 'usr_1', // fallback
      content: this.newCommentContent.trim(),
      created_at: new Date().toISOString()
    });
    this.taskForm.patchValue({ comments: current });
    this.newCommentContent = '';
  }

  onSubmit() {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      
      const totalSubtasks = formValue.subtasks ? formValue.subtasks.length : 0;
      const completed = this.completedSubtasksCount;
      const pct = totalSubtasks === 0 ? 0 : Math.round((completed / totalSubtasks) * 100);
      
      const progress_stats = `${completed}/${totalSubtasks} done · ${pct}%`;
      const progress_bar_fill = pct;

      this.taskService.addTask({
        title: formValue.title,
        description: formValue.description,
        project_id: formValue.project_id,
        assignee_ids: formValue.assignee_ids,
        subtasks: formValue.subtasks,
        comments: formValue.comments,
        priority: formValue.priority,
        status: formValue.status,
        due_date: formValue.due_date,
        progress_stats,
        progress_bar_fill
      });
      
      this.successMessage = `Task "${formValue.title}" assigned successfully!`;
      
      // Reset form but keep default values
      this.taskForm.reset({
        priority: 'Medium',
        status: 'To Do',
        project_id: formValue.project_id, // keep selected project for convenience
        assignee_ids: [],
        subtasks: [],
        comments: [],
        due_date: ''
      });
      
      setTimeout(() => this.successMessage = '', 3000);
    }
  }

  onSubmitProject() {
    if (this.projectForm.valid) {
      const name = this.projectForm.value.name;
      const owner_id = this.projectForm.value.owner_id;
      this.projectService.addProject(name, owner_id);
      
      this.projectSuccessMessage = `Project "${name}" created successfully!`;
      this.projectForm.reset();
      
      setTimeout(() => this.projectSuccessMessage = '', 3000);
    }
  }

  goToBoard() {
    this.router.navigate(['/board']);
  }
}
