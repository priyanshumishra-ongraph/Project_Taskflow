import { Component, inject, TemplateRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
    CommonModule, FormsModule, RouterModule, MatMenuModule, MatIconModule, MatButtonModule,
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
  isCollapsed = window.innerWidth <= 768;
  wasMobile = window.innerWidth <= 768;

  @HostListener('window:resize')
  onResize() {
    const isMobile = window.innerWidth <= 768;
    if (isMobile !== this.wasMobile) {
      this.isCollapsed = isMobile;
      this.wasMobile = isMobile;
    }
  }
  searchQuery = '';

  get filteredProjects$() {
    return this.projects$.pipe(
      map(projects => projects.filter(p => p.name.toLowerCase().includes(this.searchQuery.toLowerCase())))
    );
  }

  selectProject(id: string) {
    this.projectService.setSelectedProject(id);
    if (!this.isInAdminRoute) {
      this.router.navigate(['/board']);
    }
  }

  clearProjectSelection() {
    this.projectService.setSelectedProject('');
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  closeOnMobile() {
    if (window.innerWidth <= 768) {
      this.isCollapsed = true;
    }
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
      let formattedName = this.newProjectName.trim();
      formattedName = formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
      this.projectService.addProject(formattedName, this.newProjectOwnerId).subscribe({
        next: () => {
          this.dialog.closeAll();
          this.snackBar.open(`Project "${formattedName}" created successfully!`, 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.newProjectName = '';
          this.newProjectOwnerId = '';
        },
        error: (err) => {
          this.snackBar.open(err.error?.error || 'Failed to create project. Name must be unique.', 'Close', { duration: 4000 });
        }
      });
    }
  }

  editProject(project: Project) {
    this.activeProject = project;
    this.editProjectName = project.name;
    this.dialog.open(this.editProjectDialog, { width: '400px' });
  }

  confirmEditProject() {
    if (this.activeProject && this.editProjectName.trim() && this.editProjectName.trim() !== this.activeProject.name) {
      let formattedName = this.editProjectName.trim();
      formattedName = formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
      this.projectService.updateProject(this.activeProject.id, { name: formattedName }).subscribe({
        next: () => {
          this.dialog.closeAll();
          this.snackBar.open('Project renamed successfully!', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
        },
        error: (err) => {
          this.snackBar.open(err.error?.error || 'Failed to rename project. Name must be unique.', 'Close', { duration: 4000 });
        }
      });
    }
  }

  deleteProject(project: Project) {
    this.activeProject = project;
    this.dialog.open(this.deleteProjectDialog, { width: '400px' });
  }

  confirmDeleteProject() {
    if (this.activeProject) {
      this.projectService.deleteProject(this.activeProject.id).subscribe({
        next: () => {
          this.dialog.closeAll();
          this.snackBar.open('Project deleted successfully!', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
        },
        error: (err) => {
          this.snackBar.open(err.error?.error || 'Failed to delete project.', 'Close', { duration: 3000 });
        }
      });
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
        this.projectService.updateProject(this.activeProject.id, { owner_id: this.assigneeId }).subscribe({
          next: () => {
            this.dialog.closeAll();
            const assigneeName = users.find(u => u.id === this.assigneeId)?.name;
            this.snackBar.open(`Project assigned to ${assigneeName}`, 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
          },
          error: (err) => {
            this.snackBar.open('Failed to assign project.', 'Close', { duration: 3000 });
          }
        });
      } else {
        this.snackBar.open('Invalid User ID', 'Close', { duration: 3000 });
      }
    }
  }
}
