import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Task } from '../models/task.model';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { ProjectService } from './project.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private projectService = inject(ProjectService);
  private apiUrl = 'http://localhost:3000/tasks';
  
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$: Observable<Task[]> = this.tasksSubject.asObservable();
  
  public users = signal<any[]>([]);

  private searchSubject = new BehaviorSubject<string>('');
  private statusSubject = new BehaviorSubject<string>('');
  private assigneeSubject = new BehaviorSubject<string>('');
  private prioritySubject = new BehaviorSubject<string>('');

  constructor() {
    this.http.get<any[]>('http://localhost:3000/users').subscribe({
      next: (users) => {
        this.users.set(users);
        this.initTaskStream();
      },
      error: (err) => console.error("Failed to load users:", err)
    });
  }

  private initTaskStream() {
    combineLatest([
      this.searchSubject,
      this.statusSubject,
      this.assigneeSubject,
      this.prioritySubject,
      this.projectService.selectedProjectId$
    ]).pipe(
      debounceTime(300),
      switchMap(([q, status, assignee, priority, projectId]) => {
        let params = new HttpParams();
        if (q) params = params.set('q', q);
        if (status) params = params.set('status', status);
        if (assignee) params = params.set('assignee_ids_like', assignee);
        if (priority) params = params.set('priority', priority);
        if (projectId) params = params.set('project_id', projectId);
        return this.http.get<Task[]>(this.apiUrl, { params });
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
      },
      error: (err) => console.error("Failed to load tasks:", err)
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
    // re-trigger the stream with current values
    this.searchSubject.next(this.searchSubject.value);
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
      project_id: newTask.project_id || this.projectService.getSelectedProjectId(),
      assignee_ids: newTask.assignee_ids && newTask.assignee_ids.length ? newTask.assignee_ids : ['usr_1'],
      creator_id: 'usr_1',
      created_at: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      ...newTask
    };
    
    // Explicitly delete frontend computed fields that shouldn't persist in db.json
    delete (task as any).assignee_names;
    delete (task as any).assignee_initials_list;
    delete (task as any).creator_name;
    delete (task as any).progress_label;
    delete (task as any).progress_stats;
    delete (task as any).progress_bar_fill;

    this.http.post<Task>(this.apiUrl, task).subscribe(() => this.loadTasks());
  }

  updateTask(id: string, updates: Partial<Task>) {
    this.http.patch<Task>(`${this.apiUrl}/${id}`, updates).subscribe(() => this.loadTasks());
  }

  deleteTask(id: string) {
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe(() => this.loadTasks());
  }
}
