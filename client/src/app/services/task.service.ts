import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  
  // The central signal for tasks
  public tasks = signal<Task[]>([]);
  public users = signal<any[]>([]);

  constructor() { }

  loadTasks() {
    this.http.get<any>('sample-data.json').subscribe({
      next: (data) => {
        const users = data.users || [];
        this.users.set(users);
        const tasksData = data.tasks || [];
        
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
            created_at: "Jul 25, 2026"
          };
        });
        
        this.tasks.set(parsedTasks);
      },
      error: (err) => {
        console.error("Failed to load sample data:", err);
      }
    });
  }

  addTask(newTask: Partial<Task>) {
    const task: Task = {
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
    
    this.tasks.update(tasks => [task, ...tasks]);
  }

  updateTask(id: string, updates: Partial<Task>) {
    this.tasks.update(tasks => 
      tasks.map(t => t.id === id ? { ...t, ...updates } : t)
    );
  }

  deleteTask(id: string) {
    this.tasks.update(tasks => tasks.filter(t => t.id !== id));
  }
}
