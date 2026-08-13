import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectService, Project } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { map } from 'rxjs/operators';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatMenuModule, MatIconModule, MatButtonModule,
    MatDialogModule, MatSnackBarModule, MatFormFieldModule, MatInputModule, MatSelectModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  projectService = inject(ProjectService);
  authService = inject(AuthService);
  taskService = inject(TaskService);
  dialog = inject(MatDialog);
  snackBar = inject(MatSnackBar);
  router = inject(Router);
  
  @ViewChild('createProjectDialog') createProjectDialog!: TemplateRef<any>;
  @ViewChild('editProjectDialog') editProjectDialog!: TemplateRef<any>;
  @ViewChild('deleteProjectDialog') deleteProjectDialog!: TemplateRef<any>;
  @ViewChild('assignProjectDialog') assignProjectDialog!: TemplateRef<any>;

  get isInAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }
  
  newProjectName = '';
  newProjectOwnerId = '';
  editProjectName = '';
  assigneeId = '';
  activeProject: Project | null = null;
  
  projects$ = this.projectService.projects$;
  selectedProjectId$ = this.projectService.selectedProjectId$;
  isCollapsed = false;
  searchQuery = '';

  get filteredProjects$() {
    return this.projects$.pipe(
      map(projects => projects.filter(p => p.name.toLowerCase().includes(this.searchQuery.toLowerCase())))
    );
  }

  selectProject(id: string) {
    this.projectService.setSelectedProject(id);
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  addNewProject() {
    this.newProjectName = '';
    this.newProjectOwnerId = '';
    this.dialog.open(this.createProjectDialog, {
      width: '400px'
    });
  }

  confirmCreateProject() {
    if (this.newProjectName && this.newProjectName.trim()) {
      this.projectService.addProject(this.newProjectName.trim(), this.newProjectOwnerId);
      this.dialog.closeAll();
      this.snackBar.open(`Project "${this.newProjectName.trim()}" created successfully!`, 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
      this.newProjectName = '';
      this.newProjectOwnerId = '';
    }
  }

  editProject(project: Project) {
    this.activeProject = project;
    this.editProjectName = project.name;
    this.dialog.open(this.editProjectDialog, { width: '400px' });
  }

  confirmEditProject() {
    if (this.activeProject && this.editProjectName.trim() && this.editProjectName.trim() !== this.activeProject.name) {
      this.projectService.updateProject(this.activeProject.id, { name: this.editProjectName.trim() });
      this.dialog.closeAll();
      this.snackBar.open('Project renamed successfully!', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
    }
  }

  deleteProject(project: Project) {
    this.activeProject = project;
    this.dialog.open(this.deleteProjectDialog, { width: '400px' });
  }

  confirmDeleteProject() {
    if (this.activeProject) {
      this.projectService.deleteProject(this.activeProject.id);
      this.dialog.closeAll();
      this.snackBar.open('Project deleted successfully!', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
    }
  }

  assignProject(project: Project) {
    this.activeProject = project;
    this.assigneeId = project.owner_id || '';
    this.dialog.open(this.assignProjectDialog, { width: '400px' });
  }

  confirmAssignProject() {
    if (this.activeProject && this.assigneeId) {
      const users = this.taskService.users();
      if (users.find(u => u.id === this.assigneeId)) {
        this.projectService.updateProject(this.activeProject.id, { owner_id: this.assigneeId });
        this.dialog.closeAll();
        const assigneeName = users.find(u => u.id === this.assigneeId)?.name;
        this.snackBar.open(`Project assigned to ${assigneeName}`, 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
      } else {
        this.snackBar.open('Invalid User ID', 'Close', { duration: 3000 });
      }
    }
  }
}
