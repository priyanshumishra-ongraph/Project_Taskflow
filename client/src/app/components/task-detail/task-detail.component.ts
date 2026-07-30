import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css']
})
export class TaskDetailComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private taskService = inject(TaskService);

  taskForm!: FormGroup;
  isEditMode = false;
  taskId: string | null = null;
  
  statusOptions = ['To Do', 'In Progress', 'In Review', 'Completed'];

  ngOnInit(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      status: ['To Do', [Validators.required]],
      due_date: ['', [Validators.required]]
    });

    this.taskId = this.route.snapshot.paramMap.get('id');
    
    if (this.taskId && this.taskId !== 'new') {
      this.isEditMode = true;
      this.taskService.tasks$.subscribe(tasks => {
        const task = tasks.find(t => t.id === this.taskId);
        
        if (task) {
          // format date for input type="date"
          let formattedDate = '';
          if (task.due_date) {
            const d = new Date(task.due_date);
            if (!isNaN(d.getTime())) {
              formattedDate = d.toISOString().split('T')[0];
            }
          }
          
          this.taskForm.patchValue({
            title: task.title,
            status: task.status,
            due_date: formattedDate
          });
        }
      });
    }
  }

  onSubmit(): void {
    this.taskForm.markAllAsTouched();
    
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      
      if (this.isEditMode && this.taskId) {
        this.taskService.updateTask(this.taskId, {
          title: formValue.title,
          status: formValue.status,
          due_date: formValue.due_date
        });
      } else {
        this.taskService.addTask({
          title: formValue.title,
          status: formValue.status,
          due_date: formValue.due_date
        });
      }
      
      this.router.navigate(['/board']);
    }
  }

  onCancel(): void {
    this.router.navigate(['/board']);
  }
}
