// abdulqadirrhuss/intell-planner/Intell-planner-e4eec65ae3452797ce24afb321a4c1a7a0f5cce3/types.ts

// Defines a subtask, which belongs to a parent task
export interface Subtask {
  id: string;
  parent_task_id: string;
  log_date: string;
  text: string;
  completed: boolean;
  isRecurring: boolean; // NEW: Track if this subtask is recurring
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  categoryId: string;
  isRecurring: boolean;
  subtasks: Subtask[];
}

// Defines a template for creating subtasks under a recurring task
export interface RecurringSubtaskTemplate {
  id: string;
  parent_template_id: string;
  text: string;
}

export interface RecurringTaskTemplate {
  id: string;
  text: string;
  categoryId: string;
  daysOfWeek: number[];
  subtaskTemplates: RecurringSubtaskTemplate[];
}

export interface Category {
  id: string;
  name: string;
  color: string;
  recurringTasks: RecurringTaskTemplate[];
}

export interface DayType {
  id: string;
  name: string;
  categoryIds: string[]; 
}

export interface DailyLog {
  date: string;
  dayTypeId: string | null;
  tasks: Task[];
}
