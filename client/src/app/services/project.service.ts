import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Project {
  id: string;
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/projects';
  
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  public projects$: Observable<Project[]> = this.projectsSubject.asObservable();

  private selectedProjectIdSubject = new BehaviorSubject<string>('proj_1');
  public selectedProjectId$: Observable<string> = this.selectedProjectIdSubject.asObservable();

  constructor() {
    this.loadProjects();
  }

  loadProjects() {
    this.http.get<Project[]>(this.apiUrl).subscribe({
      next: (projects) => this.projectsSubject.next(projects),
      error: (err) => console.error("Failed to load projects:", err)
    });
  }

  setSelectedProject(id: string) {
    this.selectedProjectIdSubject.next(id);
  }

  getSelectedProjectId(): string {
    return this.selectedProjectIdSubject.value;
  }

  addProject(name: string) {
    const newProject: Partial<Project> = {
      id: 'proj_' + Math.random().toString(36).substr(2, 9),
      name,
      description: ''
    };
    this.http.post<Project>(this.apiUrl, newProject).subscribe(() => this.loadProjects());
  }
}
