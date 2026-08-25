
import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Task } from '../../models/task.model';
import { RouterModule, Router } from '@angular/router';

const MIN_WORK_SECONDS = 4 * 60 * 60; // 4 hours in seconds

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  taskService = inject(TaskService);
  router = inject(Router);
  cdr = inject(ChangeDetectorRef);

  userName: string = 'User';
  completedTasksCount: number = 0;
  todoTasksCount: number = 0;
  inProgressTasksCount: number = 0;
  testingTasksCount: number = 0;

  overdueTasksCount: number = 0;
  deadlineApproachingCount: number = 0;
  overallScore: number = 100;

  recentTasks: Task[] = [];
  overdueTasksList: Task[] = [];

  // Category Task Lists for Dropdowns
  todoTasksList: Task[] = [];
  inProgressTasksList: Task[] = [];
  testingTasksList: Task[] = [];
  completedTasksList: Task[] = [];
  deadlineApproachingList: Task[] = [];

  expandedCard: string | null = null;

  // Attendance / Timer
  isCheckedIn: boolean = false;
  checkInTimestamp: number | null = null;   // epoch ms when checked in
  checkInTime: string | null = null;         // human-readable
  checkOutTime: string | null = null;
  checkInDate: string | null = null;
  elapsedSeconds: number = 0;
  canCheckOut: boolean = false;
  attendanceStatus: string = 'Not checked in yet';

  private timerInterval: any = null;

  myTasks: Task[] = [];

  get elapsedFormatted(): string {
    const h = Math.floor(this.elapsedSeconds / 3600);
    const m = Math.floor((this.elapsedSeconds % 3600) / 60);
    const s = this.elapsedSeconds % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  get progressPercent(): number {
    return Math.min(100, Math.round((this.elapsedSeconds / MIN_WORK_SECONDS) * 100));
  }

  get remainingFormatted(): string {
    const remaining = Math.max(0, MIN_WORK_SECONDS - this.elapsedSeconds);
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    return remaining <= 0 ? 'Goal reached!' : `${h}h ${m}m remaining`;
  }

  toggleCard(cardName: string, event: Event) {
    event.stopPropagation();
    this.expandedCard = this.expandedCard === cardName ? null : cardName;
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.expandedCard = null;
  }

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.userName = user.name || user.email?.split('@')[0] || 'User';
    }

    this.taskService.tasks$.subscribe(tasks => {
      const currentUser = this.authService.currentUser();
      if (!currentUser) return;

      const myTasks = tasks.filter(t => t.assignee_ids?.includes(currentUser.id));

      this.todoTasksCount = 0; this.todoTasksList = [];
      this.inProgressTasksCount = 0; this.inProgressTasksList = [];
      this.testingTasksCount = 0; this.testingTasksList = [];
      this.completedTasksCount = 0; this.completedTasksList = [];
      this.overdueTasksCount = 0; this.overdueTasksList = [];
      this.deadlineApproachingCount = 0; this.deadlineApproachingList = [];

      const today = new Date(); today.setHours(0,0,0,0);
      const in7Days = new Date(today); in7Days.setDate(today.getDate() + 7);

      myTasks.forEach(t => {
        if (t.status === 'To Do') { this.todoTasksCount++; this.todoTasksList.push(t); }
        else if (t.status === 'In Progress') { this.inProgressTasksCount++; this.inProgressTasksList.push(t); }
        else if (t.status === 'Testing') { this.testingTasksCount++; this.testingTasksList.push(t); }
        else if (t.status === 'Completed') { this.completedTasksCount++; this.completedTasksList.push(t); }

        if (t.due_date && t.status !== 'Completed') {
          const due = new Date(t.due_date); due.setHours(0,0,0,0);
          if (due < today) { this.overdueTasksCount++; this.overdueTasksList.push(t); }
          else if (due >= today && due <= in7Days) { this.deadlineApproachingCount++; this.deadlineApproachingList.push(t); }
        }
      });

      this.overdueTasksList.sort((a,b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());
      this.deadlineApproachingList.sort((a,b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());
      this.recentTasks = myTasks.filter(t => t.status !== 'Completed')
        .sort((a,b) => new Date(b.created_at||0).getTime() - new Date(a.created_at||0).getTime())
        .slice(0, 5);

      this.overallScore = Math.max(0, 100 - (this.overdueTasksCount * 5));
      this.cdr.detectChanges();
    });

    // Restore saved attendance state
    this.restoreAttendanceState();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  private restoreAttendanceState() {
    const saved = localStorage.getItem('attendance_state');
    if (saved) {
      const state = JSON.parse(saved);
      if (state.isCheckedIn && state.checkInTimestamp) {
        this.isCheckedIn = true;
        this.checkInTimestamp = state.checkInTimestamp;
        this.checkInTime = state.checkInTime;
        this.checkInDate = state.checkInDate;
        // Resume timer with elapsed time
        this.elapsedSeconds = Math.floor((Date.now() - state.checkInTimestamp) / 1000);
        this.canCheckOut = this.elapsedSeconds >= MIN_WORK_SECONDS;
        this.startTimer();
      } else if (!state.isCheckedIn) {
        this.checkInTime = state.checkInTime;
        this.checkOutTime = state.checkOutTime;
        this.checkInDate = state.checkInDate;
        this.elapsedSeconds = state.elapsedSeconds || 0;
        this.canCheckOut = false;
      }
    }
  }

  toggleAttendance() {
    if (!this.isCheckedIn) {
      // CHECK IN
      this.isCheckedIn = true;
      this.checkInTimestamp = Date.now();
      const now = new Date();
      this.checkInTime = now.toLocaleTimeString();
      this.checkInDate = now.toLocaleDateString();
      this.checkOutTime = null;
      this.elapsedSeconds = 0;
      this.canCheckOut = false;
      this.startTimer();
      this.saveAttendanceState();
      this.saveToHistory('checkIn', now);
    } else {
      // CHECK OUT — only allowed after 4 hours
      if (!this.canCheckOut) return;
      this.isCheckedIn = false;
      this.stopTimer();
      const now = new Date();
      this.checkOutTime = now.toLocaleTimeString();
      this.saveAttendanceState();
      this.saveToHistory('checkOut', now);
    }
  }

  private startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      if (this.checkInTimestamp) {
        this.elapsedSeconds = Math.floor((Date.now() - this.checkInTimestamp) / 1000);
        this.canCheckOut = this.elapsedSeconds >= MIN_WORK_SECONDS;
        this.cdr.detectChanges();
      }
    }, 1000);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private saveAttendanceState() {
    localStorage.setItem('attendance_state', JSON.stringify({
      isCheckedIn: this.isCheckedIn,
      checkInTimestamp: this.checkInTimestamp,
      checkInTime: this.checkInTime,
      checkOutTime: this.checkOutTime,
      checkInDate: this.checkInDate,
      elapsedSeconds: this.elapsedSeconds
    }));
  }

  private saveToHistory(event: 'checkIn' | 'checkOut', timestamp: Date) {
    const dateKey = timestamp.toLocaleDateString();
    const historyJson = localStorage.getItem('attendance_history');
    let history: any = historyJson ? JSON.parse(historyJson) : {};
    if (!history[dateKey]) history[dateKey] = { checkIn: null, checkOut: null, totalSeconds: 0 };
    if (event === 'checkIn') {
      if (!history[dateKey].checkIn) history[dateKey].checkIn = timestamp.toLocaleTimeString();
    } else {
      history[dateKey].checkOut = timestamp.toLocaleTimeString();
      history[dateKey].totalSeconds = this.elapsedSeconds;
    }
    localStorage.setItem('attendance_history', JSON.stringify(history));
  }

  updateAttendanceStatus() {
    // kept for backward compat
  }

  togglePerformanceModal() {
    this.router.navigate(['/performance']);
  }
}
