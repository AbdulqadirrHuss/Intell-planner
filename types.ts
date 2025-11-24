export interface Task {
  id: string;
  text: string;
  completed: boolean;
  categoryId: string;
  isRecurring: boolean;
  subtasks: Subtask[]; 
}

export interface Subtask {
  id: string;
  parent_task_id: string; 
  log_date: string;       
  text: string;
  completed: boolean;
  isRecurring: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  recurringTasks: RecurringTaskTemplate[]; 
}

export interface RecurringTaskTemplate {
  id: string;
  text: string;
  categoryId: string;
  daysOfWeek: number[]; 
  subtaskTemplates: RecurringSubtaskTemplate[]; 
}

export interface RecurringSubtaskTemplate {
  id: string;
  parent_template_id: string; 
  text: string;
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

// --- STATISTICS TYPES ---
export type TrackerType = 'percent' | 'count' | 'check';

export interface StatDefinition {
  id: string;
  name: string;
  type: TrackerType;
  linked_category_id?: string;
  target?: number;
  color?: string;
  goal_direction?: 'up' | 'down'; // 'up' means higher is better (default), 'down' means lower is better
}

export interface StatValue {
  id: string;
  date: string;
  stat_definition_id: string;
  value: number;
  is_manual: boolean;
}
