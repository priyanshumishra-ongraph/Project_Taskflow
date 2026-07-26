import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskCardComponent } from './task-card.component';
import { Task } from '../../models/task.model';

declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;

describe('TaskCardComponent', () => {
  let component: TaskCardComponent;
  let fixture: ComponentFixture<TaskCardComponent>;

  const mockTask: Task = {
    id: 'test_1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'To Do',
    priority: 'Low',
    due_date: '2026-07-27T00:00:00Z',
    project_id: 'proj_1',
    assignee_id: 'usr_1',
    assignee_name: 'Test User',
    assignee_initials: 'TU',
    progress_label: 'Tasklists',
    progress_stats: '0/0 done \u00B7 0%',
    progress_bar_fill: 0
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskCardComponent);
    component = fixture.componentInstance;
    component.task = mockTask; // Provide required input
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
