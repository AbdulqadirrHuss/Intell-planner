export interface Task {
  id: string;
  text: string;
  completed: boolean;
  categoryId: string;
  isRecurring: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  recurringTasks: RecurringTaskTemplate[]; // CATEGORY now owns recurring tasks
}

export interface RecurringTaskTemplate {
  id: string;
  text: string;
  categoryId: string;
}

export interface DayType {
  id: string;
  name: string;
  categoryIds: string[]; // DAY TYPE now just has a list of category IDs
}

export interface DailyLog {
  date: string;
  dayTypeId: string | null;
  tasks: Task[];
}
