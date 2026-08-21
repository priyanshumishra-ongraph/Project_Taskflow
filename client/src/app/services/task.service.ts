import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task } from '../models/task.model';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { debounceTime, map, tap } from 'rxjs/operators';
import { ProjectService } from './project.service';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private projectService = inject(ProjectService);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/tasks`;
  
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$: Observable<Task[]> = this.tasksSubject.asObservable();
  
  // Temporary hardcoded users until Users API is built
  public users = signal<any[]>([
    { id: 'usr_1', name: 'John Doe', role: 'Admin' },
    { id: 'usr_2', name: 'Jane Smith', role: 'Member' },
    { id: 'usr_3', name: 'Bob Johnson', role: 'Member' }
  ]);

  private searchSubject = new BehaviorSubject<string>('');
  private statusSubject = new BehaviorSubject<string>('');
  private assigneeSubject = new BehaviorSubject<string>('');
  private prioritySubject = new BehaviorSubject<string>('');
  
  // Internal behavior subject for raw tasks from API
  private localTasksSubject = new BehaviorSubject<Task[]>([]);

  public isLoading = signal<boolean>(false);
  public error = signal<string | null>(null);

  constructor() {
    this.fetchTasks();
    this.initTaskStream();
  }
  
  private fetchTasks() {
    this.isLoading.set(true);
    this.error.set(null); 
    this.http.get<{data: Task[]}>(this.apiUrl).subscribe({
      next: (res) => {
        this.localTasksSubject.next(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Failed to load tasks from API:", err);
        this.error.set(err.error?.error || 'Failed to load tasks.');
        this.localTasksSubject.next([]);
        this.isLoading.set(false);
      }
    });
  }

  private initTaskStream() {
    combineLatest([
      this.localTasksSubject,
      this.searchSubject,
      this.statusSubject,
      this.assigneeSubject,
      this.prioritySubject,
      this.projectService.selectedProjectId$
    ]).pipe(
      debounceTime(100),
      map(([tasks, q, status, assignee, priority, projectId]) => {
        let filteredTasks = tasks;
        
        // Task Visibility Rule based on Role
        const currentUser = this.authService.currentUser();
        if (currentUser && currentUser.role !== 'Admin') {
           filteredTasks = filteredTasks.filter(t => t.assignee_ids?.includes(currentUser.id) || t.assignee_id === currentUser.id);
        }

        if (q) {
          const lowerQ = q.toLowerCase();
          filteredTasks = filteredTasks.filter(t => t.title?.toLowerCase().includes(lowerQ) || t.description?.toLowerCase().includes(lowerQ));
        }
        if (status) {
          filteredTasks = filteredTasks.filter(t => t.status === status);
        }
        if (assignee) {
          filteredTasks = filteredTasks.filter(t => t.assignee_ids?.includes(assignee) || t.assignee_id === assignee);
        }
        if (priority) {
          filteredTasks = filteredTasks.filter(t => t.priority === priority);
        }
        if (projectId) {
          filteredTasks = filteredTasks.filter(t => t.project_id === projectId);
        }
        return filteredTasks;
      })
    ).subscribe({
      next: (tasksData) => {
        const users = this.users();
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

          let creator_name = 'Unknown';
          if (task.creator_id) {
            const creator = users.find((u: any) => u.id === task.creator_id);
            if (creator) creator_name = creator.name;
          } else if (assignee_names.length > 0) {
            creator_name = assignee_names[0]; // fallback to assignee if no creator specified
          }

          let progress_stats = '0/0 done \u00B7 0%';
          let progress_bar_fill = 0;
          const subtasks = task.subtasks || [];
          if (subtasks.length > 0) {
            const completed = subtasks.filter((st: any) => st.is_completed).length;
            const total = subtasks.length;
            progress_bar_fill = Math.round((completed / total) * 100);
            progress_stats = `${completed}/${total} done \u00B7 ${progress_bar_fill}%`;
          }

          return {
            ...task,
            assignee_ids,
            assignee_names,
            assignee_initials_list,
            creator_name,
            progress_label: 'Tasklists',
            progress_stats,
            progress_bar_fill,
            created_at: task.created_at || "Jul 25, 2026"
          };
        });
        this.tasksSubject.next(parsedTasks);
      }
    });
  }

  updateSearch(q: string) {
    this.searchSubject.next(q);
  }

  updateStatus(status: string) {
    this.statusSubject.next(status);
  }

  updateAssignee(assigneeId: string) {
    this.assigneeSubject.next(assigneeId);
  }

  updatePriority(priority: string) {
    this.prioritySubject.next(priority);
  }

  loadTasks() {
    this.fetchTasks();
  }

  clearTasks() {
    this.tasksSubject.next([]);
  }

  addTask(newTask: Partial<Task>): Observable<Task> {
    const task = {
      title: newTask.title || 'Untitled Task',
      description: newTask.description || '',
      status: newTask.status || 'To Do',
      priority: newTask.priority || 'Low',
      due_date: newTask.due_date || new Date().toISOString(),
      project_id: newTask.project_id || this.projectService.getSelectedProjectId(),
      assignee_ids: newTask.assignee_ids && newTask.assignee_ids.length ? newTask.assignee_ids : ['usr_1'],
      ...newTask
    };
    
    // Explicitly delete frontend computed fields that shouldn't persist
    delete (task as any).assignee_names;
    delete (task as any).assignee_initials_list;
    delete (task as any).creator_name;
    delete (task as any).progress_label;
    delete (task as any).progress_stats;
    delete (task as any).progress_bar_fill;

    return this.http.post<{data: Task}>(this.apiUrl, task).pipe(
      map(res => res.data),
      tap(savedTask => {
        const currentTasks = this.localTasksSubject.value;
        this.localTasksSubject.next([...currentTasks, savedTask]);
      })
    );
  }

  updateTask(id: string, updates: Partial<Task>): Observable<Task> {
    return this.http.put<{data: Task}>(`${this.apiUrl}/${id}`, updates).pipe(
      map(res => res.data),
      tap(updatedTask => {
        const currentTasks = this.localTasksSubject.value;
        const newTasks = currentTasks.map(t => t.id === id ? updatedTask : t);
        this.localTasksSubject.next(newTasks);
      })
    );
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const currentTasks = this.localTasksSubject.value;
        const newTasks = currentTasks.filter(t => t.id !== id);
        this.localTasksSubject.next(newTasks);
      })
    );
  }
}
