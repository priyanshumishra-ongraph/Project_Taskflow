export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  project_id: string;
  assignee_ids?: string[];
  assignee_names?: string[];
  assignee_initials_list?: string[];
  // Legacy fields
  assignee_id?: string;
  assignee_name?: string;
  assignee_initials?: string;
  created_at?: string;
  subtasks?: any[];
  tag_ids?: string[];
  comments?: any[];
  time_logs?: any[];
  
  // Computed fields for UI loaded from JSON
  progress_label?: string;
  progress_stats?: string;
  progress_bar_fill?: number;
}
