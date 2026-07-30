import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task } from '../models/task.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/tasks';
  
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$: Observable<Task[]> = this.tasksSubject.asObservable();
  
  public users = signal<any[]>([]);

  constructor() { }

  loadTasks() {
    this.http.get<any>('http://localhost:3000/users').subscribe({
      next: (users) => {
        this.users.set(users);
        this.http.get<Task[]>(this.apiUrl).subscribe({
          next: (tasksData) => {
            const parsedTasks = tasksData.map((task: any) => {
              let assignee_ids = task.assignee_ids || [];
              if (assignee_ids.length === 0 && task.assignee_id) {
                assignee_ids = [task.assignee_id];
              }
              
              let assignee_names: string[] = [];
              let assignee_initials_list: string[] = [];
              
              for (const id of assignee_ids) {
                const user = users.find((u: any) => u.id === id);
                if (user) {
                  assignee_names.push(user.name);
                  assignee_initials_list.push(user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase());
                }
              }

              return {
                ...task,
                assignee_ids,
                assignee_names,
                assignee_initials_list,
                created_at: task.created_at || "Jul 25, 2026"
              };
            });
            this.tasksSubject.next(parsedTasks);
          },
          error: (err) => console.error("Failed to load tasks:", err)
        });
      },
      error: (err) => {
        console.error("Failed to load users:", err);
      }
    });
  }

  clearTasks() {
    this.tasksSubject.next([]);
  }

  addTask(newTask: Partial<Task>) {
    const task: Partial<Task> = {
      id: 'task_' + Math.random().toString(36).substr(2, 9),
      title: newTask.title || 'Untitled Task',
      description: newTask.description || '',
      status: newTask.status || 'To Do',
      priority: newTask.priority || 'Low',
      due_date: newTask.due_date || new Date().toISOString(),
      project_id: newTask.project_id || 'proj_1',
      assignee_ids: newTask.assignee_ids && newTask.assignee_ids.length ? newTask.assignee_ids : ['usr_1'],
      assignee_names: newTask.assignee_names || ['Me'],
      assignee_initials_list: newTask.assignee_initials_list || ['ME'],
      created_at: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      progress_label: 'Tasklists',
      progress_stats: '0/0 done \u00B7 0%',
      progress_bar_fill: 0,
      ...newTask
    };
    
    this.http.post<Task>(this.apiUrl, task).subscribe(() => this.loadTasks());
  }

  updateTask(id: string, updates: Partial<Task>) {
    this.http.patch<Task>(`${this.apiUrl}/${id}`, updates).subscribe(() => this.loadTasks());
  }

  deleteTask(id: string) {
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe(() => this.loadTasks());
  }
}
