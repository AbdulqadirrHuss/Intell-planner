// abdulqadirrhuss/intell-planner/Intell-planner-e4eec65ae3452797ce24afb321a4c1a7a0f5cce3/types.ts

// NEW: Defines a subtask, which belongs to a parent task
export interface Subtask {
  id: string;
  parent_task_id: string; // ID of the Task it belongs to
  log_date: string;       // Helps with Supabase queries
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  categoryId: string;
  isRecurring: boolean;
  subtasks: Subtask[]; // MODIFIED: Task now owns an array of Subtasks
}

// NEW: Defines a template for creating subtasks under a recurring task
export interface RecurringSubtaskTemplate {
  id: string;
  parent_template_id: string; // ID of the RecurringTaskTemplate it belongs to
  text: string;
}

export interface RecurringTaskTemplate {
  id: string;
  text: string;
  categoryId: string;
  daysOfWeek: number[]; // NEW: Array of numbers (0-6) for Sun-Sat
  subtaskTemplates: RecurringSubtaskTemplate[]; // NEW: Recurring tasks can have subtask templates
}

export interface Category {
  id: string;
  name: string;
  color: string;
  recurringTasks: RecurringTaskTemplate[]; // This now contains the new, richer RecurringTaskTemplate
}

export interface DayType {
  id: string;
  name: string;
  categoryIds: string[]; 
}

export interface DailyLog {
  date: string;
  dayTypeId: string | null;
  tasks: Task[]; // This will be a list of parent tasks, each containing its subtasks
}
