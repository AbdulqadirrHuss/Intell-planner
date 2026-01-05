export interface Task {
  id: string;
  text: string;
  completed: boolean;
  categoryId: string;
  isRecurring: boolean;
  isImportant?: boolean;
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
  parentTemplateId: string;
  text: string;
}

export interface DayType {
  id: string;
  name: string;
  categoryIds: string[];
  // ADDED THIS LINE:
  recurringTasks: RecurringTaskTemplate[];
}

export interface DailyLog {
  date: string;
  dayTypeId: string | null;
  tasks: Task[];
}

export type TrackerType = 'percent' | 'count' | 'check';

export interface StatDefinition {
  id: string;
  name: string;
  type: TrackerType;
  frequency: 'daily' | 'weekly';
  linked_category_id?: string;
  target?: number;
  color?: string;
  goal_direction?: 'up' | 'down';
}

export interface StatValue {
  id: string;
  date: string;
  stat_definition_id: string;
  value: number;
  is_manual: boolean;
}

export interface DriveItem {
  id: string;
  created_at: string;
  name: string;
  type: 'folder' | 'file';
  parent_id: string | null;
  size?: number;
  mime_type?: string;
  url?: string;
  owner_id: string;
}

export interface Breadcrumb {
  id: string;
  name: string;
}
