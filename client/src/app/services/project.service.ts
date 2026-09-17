import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
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
  
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  public projects$: Observable<Project[]> = this.projectsSubject.asObservable();

  private selectedProjectIdSubject = new BehaviorSubject<string>('');
  public selectedProjectId$: Observable<string> = this.selectedProjectIdSubject.asObservable();

  constructor() {
    this.loadProjects();
  }

  loadProjects() {
    this.http.get<{data: Project[]}>(this.apiUrl).subscribe({
      next: (res) => {
        this.projectsSubject.next(res.data);
        if (res.data.length > 0 && !this.selectedProjectIdSubject.value) {
          this.selectedProjectIdSubject.next(res.data[0].id);
        }
      },
      error: (err) => console.error("Failed to load projects:", err)
    });
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
    
    return this.http.post<{data: Project}>(this.apiUrl, payload).pipe(
      tap((res) => {
        const currentProjects = this.projectsSubject.value;
        this.projectsSubject.next([...currentProjects, res.data]);
      })
    );
  }

  updateProject(id: string, payload: Partial<Project>) {
    return this.http.put<{data: Project}>(`${this.apiUrl}/${id}`, payload).pipe(
      tap((res) => {
        const currentProjects = this.projectsSubject.value;
        const updatedProjects = currentProjects.map(p => p.id === id ? res.data : p);
        this.projectsSubject.next(updatedProjects);
      })
    );
  }

  deleteProject(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const currentProjects = this.projectsSubject.value;
        const updatedProjects = currentProjects.filter(p => p.id !== id);
        this.projectsSubject.next(updatedProjects);
        
        if (this.getSelectedProjectId() === id) {
           this.setSelectedProject('');
        }
      })
    );
  }
}
