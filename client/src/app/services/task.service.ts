import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task } from '../models/task.model';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { ProjectService } from './project.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private projectService = inject(ProjectService);
  private apiUrl = `${environment.apiUrl}/tasks`;
  private readonly storageKey = 'taskflow_tasks';
  
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
  
  // Internal behavior subject for raw local storage tasks
  private localTasksSubject = new BehaviorSubject<Task[]>([]);

  constructor() {
    this.initLocalStorage();
    this.initTaskStream();
  }
  
  private initLocalStorage() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      this.localTasksSubject.next(JSON.parse(stored));
    } else {
      // Fetch from API once, store, and populate localTasksSubject
      this.http.get<{data: Task[]}>(this.apiUrl).subscribe({
        next: (res) => {
          this.saveToStorage(res.data);
          this.localTasksSubject.next(res.data);
        },
        error: (err) => {
          console.error("Failed to load initial tasks from API:", err);
          this.localTasksSubject.next([]);
        }
      });
    }
  }
  
  private saveToStorage(tasks: Task[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
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
    this.localTasksSubject.next(this.localTasksSubject.value);
  }

  clearTasks() {
    this.tasksSubject.next([]);
  }

  addTask(newTask: Partial<Task>) {
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

    this.http.post<{data: Task}>(this.apiUrl, task).subscribe({
      next: (res) => {
        const currentTasks = this.localTasksSubject.value;
        const updatedTasks = [...currentTasks, res.data];
        this.saveToStorage(updatedTasks);
        this.localTasksSubject.next(updatedTasks);
      },
      error: (err) => console.error("Failed to add task:", err)
    });
  }

  updateTask(id: string, updates: Partial<Task>) {
    this.http.put<{data: Task}>(`${this.apiUrl}/${id}`, updates).subscribe({
      next: (res) => {
        const currentTasks = this.localTasksSubject.value;
        const updatedTasks = currentTasks.map(t => t.id === id ? res.data : t);
        this.saveToStorage(updatedTasks);
        this.localTasksSubject.next(updatedTasks);
      },
      error: (err) => console.error("Failed to update task:", err)
    });
  }

  deleteTask(id: string) {
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        const currentTasks = this.localTasksSubject.value;
        const updatedTasks = currentTasks.filter(t => t.id !== id);
        this.saveToStorage(updatedTasks);
        this.localTasksSubject.next(updatedTasks);
      },
      error: (err) => console.error("Failed to delete task:", err)
    });
  }
}
