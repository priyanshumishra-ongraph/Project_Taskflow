
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, FormsModule, MatButtonModule],
  templateUrl: './performance.component.html',
  styleUrl: './performance.component.css'
})
export class PerformanceComponent implements OnInit {
  authService = inject(AuthService);
  taskService = inject(TaskService);
  router = inject(Router);

  performanceByMonth: { 
    monthName: string, 
    days: {
      date: string, 
      tasks: Task[], 
      attendance: { checkIn: string | null, checkOut: string | null } | null 
    }[]
  }[] = [];

  currentMonthName: string = '';
  statCounts = { todo: 0, inProgress: 0, testing: 0, completed: 0 };
  chartDays: { day: number, count: number, dateStr: string, fullDate: Date }[] = [];
  yAxisLabels: number[] = [8, 6, 4, 2, 0];
  maxChartValue: number = 8;
  hoveredDay: any = null;

  // Period selector
  selectedPeriod: string = 'this_month';
  periodOptions = [
    { value: 'this_month', label: 'This month' },
    { value: 'last_month', label: 'Last month' },
    { value: 'last_3_months', label: 'Last 3 months' },
    { value: 'all_time', label: 'All time' },
  ];

  private allTasks: Task[] = [];

  ngOnInit() {
    this.taskService.tasks$.subscribe(tasks => {
      this.allTasks = tasks;
      this.calculatePerformanceByDay(tasks);
    });
  }

  onPeriodChange() {
    this.calculatePerformanceByDay(this.allTasks);
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  private getPeriodRange(): { start: Date, end: Date } | null {
    const now = new Date();
    if (this.selectedPeriod === 'this_month') {
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      };
    } else if (this.selectedPeriod === 'last_month') {
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
      };
    } else if (this.selectedPeriod === 'last_3_months') {
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      };
    }
    return null; // all_time
  }

  calculatePerformanceByDay(allTasks: Task[]) {
    const user = this.authService.currentUser();
    if (!user) return;
    
    const myTasks = allTasks.filter(t => t.assignee_ids?.includes(user.id));
    
    // Setup chart month (always current month for chart)
    const now = new Date();
    this.currentMonthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    this.chartDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), i);
      this.chartDays.push({
        day: i,
        count: 0,
        dateStr: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        fullDate: d
      });
    }

    // Period range for filtering the detailed list
    const range = this.getPeriodRange();

    // Filter tasks by period for stat counts and breakdown
    const periodTasks = myTasks.filter(task => {
      if (!range) return true; // all time
      const taskDate = task.updatedAt
        ? new Date(task.updatedAt)
        : (task.due_date ? new Date(task.due_date) : null);
      if (!taskDate) return false;
      return taskDate >= range.start && taskDate <= range.end;
    });

    // Stat counts from period tasks
    this.statCounts = { todo: 0, inProgress: 0, testing: 0, completed: 0 };
    periodTasks.forEach(task => {
      if (task.status === 'To Do') this.statCounts.todo++;
      else if (task.status === 'In Progress') this.statCounts.inProgress++;
      else if (task.status === 'Testing') this.statCounts.testing++;
      else if (task.status === 'Completed') this.statCounts.completed++;
    });

    // Chart: use updatedAt date of COMPLETED tasks in current month
    myTasks.forEach(task => {
      if (task.status === 'Completed') {
        // Use updatedAt (actual completion date), fall back to due_date
        const completedDate = task.updatedAt
          ? new Date(task.updatedAt)
          : (task.due_date ? new Date(task.due_date) : null);

        if (completedDate &&
            completedDate.getMonth() === now.getMonth() &&
            completedDate.getFullYear() === now.getFullYear()) {
          const dayIndex = completedDate.getDate() - 1;
          if (this.chartDays[dayIndex]) {
            this.chartDays[dayIndex].count++;
          }
        }
      }
    });

    const maxCount = Math.max(...this.chartDays.map(d => d.count), 8);
    this.maxChartValue = Math.ceil(maxCount / 2) * 2; 
    this.yAxisLabels = [];
    for (let i = this.maxChartValue; i >= 0; i -= Math.max(2, Math.floor(this.maxChartValue / 4))) {
      this.yAxisLabels.push(i);
    }

    // Detailed breakdown grouped by actual update/completion date
    const grouped = new Map<string, Task[]>();
    periodTasks.forEach(task => {
      const rawDate = task.updatedAt
        ? new Date(task.updatedAt)
        : (task.due_date ? new Date(task.due_date) : new Date(task.created_at || 0));
      const dateStr = rawDate.toLocaleDateString();
      if (!grouped.has(dateStr)) grouped.set(dateStr, []);
      grouped.get(dateStr)!.push(task);
    });

    // Historical attendance
    const historyJson = localStorage.getItem('attendance_history');
    const attendanceHistory = historyJson ? JSON.parse(historyJson) : {};

    const allDays = Array.from(grouped.entries()).map(([date, tasks]) => ({
      date,
      tasks,
      attendance: attendanceHistory[date] || null
    }));
    
    for (const [date, record] of Object.entries(attendanceHistory)) {
      if (!grouped.has(date)) {
        allDays.push({ date, tasks: [], attendance: record as any });
      }
    }

    allDays.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const monthGroups = new Map<string, any[]>();
    allDays.forEach(day => {
      const d = new Date(day.date);
      const monthName = d.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!monthGroups.has(monthName)) {
        monthGroups.set(monthName, []);
      }
      monthGroups.get(monthName)!.push(day);
    });

    this.performanceByMonth = Array.from(monthGroups.entries()).map(([monthName, days]) => ({
      monthName,
      days
    }));
  }
}


