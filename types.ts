
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
}

export interface RecurringTaskTemplate {
  id: string;
  text: string;
  categoryId: string;
}

export interface DayType {
  id: string;
  name: string;
  recurringTasks: RecurringTaskTemplate[];
}

export interface DailyLog {
  date: string;
  dayTypeId: string | null;
  tasks: Task[];
}
