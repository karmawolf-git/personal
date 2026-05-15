export type Priority = 'low' | 'medium' | 'high';
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Schedule {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string;
  color: string;
  description?: string;
  repeat: RepeatType;
  createdAt: string;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string;
  category?: string;
  createdAt: string;
}

export interface Memo {
  id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Tab = 'monthly' | 'weekly' | 'todos' | 'memos';
