import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
  private apiUrl = `${environment.apiUrl}/projects`;
  private readonly storageKey = 'taskflow_projects';
  
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  public projects$: Observable<Project[]> = this.projectsSubject.asObservable();

  private selectedProjectIdSubject = new BehaviorSubject<string>('proj_1');
  public selectedProjectId$: Observable<string> = this.selectedProjectIdSubject.asObservable();

  constructor() {
    this.loadProjects();
  }

  loadProjects() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      this.projectsSubject.next(JSON.parse(stored));
    } else {
      this.http.get<{data: Project[]}>(this.apiUrl).subscribe({
        next: (res) => {
          this.saveToStorage(res.data);
          this.projectsSubject.next(res.data);
        },
        error: (err) => console.error("Failed to load projects:", err)
      });
    }
  }

  private saveToStorage(projects: Project[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(projects));
  }

  setSelectedProject(id: string) {
    this.selectedProjectIdSubject.next(id);
  }

  getSelectedProjectId(): string {
    return this.selectedProjectIdSubject.value;
  }

  addProject(name: string) {
    const payload = {
      name,
      description: ''
    };
    
    this.http.post<{data: Project}>(this.apiUrl, payload).subscribe({
      next: (res) => {
        const currentProjects = this.projectsSubject.value;
        const updatedProjects = [...currentProjects, res.data];
        this.saveToStorage(updatedProjects);
        this.projectsSubject.next(updatedProjects);
      },
      error: (err) => console.error("Failed to add project:", err)
    });
  }
}
