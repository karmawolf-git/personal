import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  getDay,
} from 'date-fns';
import { ko } from 'date-fns/locale';

export { format, isSameMonth, isSameDay, isToday, getDay };

export function getMonthDays(date: Date) {
  const start = startOfWeek(startOfMonth(date), { locale: ko });
  const end = endOfWeek(endOfMonth(date), { locale: ko });
  return eachDayOfInterval({ start, end });
}

export function getWeekDays(date: Date) {
  const start = startOfWeek(date, { locale: ko });
  const end = endOfWeek(date, { locale: ko });
  return eachDayOfInterval({ start, end });
}

export function nextMonth(date: Date) { return addMonths(date, 1); }
export function prevMonth(date: Date) { return subMonths(date, 1); }
export function nextWeek(date: Date) { return addWeeks(date, 1); }
export function prevWeek(date: Date) { return subWeeks(date, 1); }

export function formatDate(date: Date, fmt: string) {
  return format(date, fmt, { locale: ko });
}

export function toDateString(date: Date) {
  return format(date, 'yyyy-MM-dd');
}
