import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Project {
  id: string;
  name: string;
  description: string;
  owner_id?: string;
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

  addProject(name: string, owner_id?: string) {
    const payload = {
      name,
      description: '',
      owner_id
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

  updateProject(id: string, payload: Partial<Project>) {
    this.http.put<{data: Project}>(`${this.apiUrl}/${id}`, payload).subscribe({
      next: (res) => {
        const currentProjects = this.projectsSubject.value;
        const updatedProjects = currentProjects.map(p => p.id === id ? res.data : p);
        this.saveToStorage(updatedProjects);
        this.projectsSubject.next(updatedProjects);
      },
      error: (err) => console.error("Failed to update project:", err)
    });
  }

  deleteProject(id: string) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        const currentProjects = this.projectsSubject.value;
        const updatedProjects = currentProjects.filter(p => p.id !== id);
        this.saveToStorage(updatedProjects);
        this.projectsSubject.next(updatedProjects);
        
        if (this.getSelectedProjectId() === id) {
           this.setSelectedProject(updatedProjects.length > 0 ? updatedProjects[0].id : '');
        }
      },
      error: (err) => console.error("Failed to delete project:", err)
    });
  }
}
