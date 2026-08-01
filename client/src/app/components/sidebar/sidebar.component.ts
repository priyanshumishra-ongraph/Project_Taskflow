import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  projectService = inject(ProjectService);
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
    const name = window.prompt("Enter new project name:");
    if (name && name.trim()) {
      this.projectService.addProject(name.trim());
    }
  }
}
