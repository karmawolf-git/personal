import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { Schedule } from '../types';
import {
  getMonthDays, formatDate, isSameMonth, isToday, toDateString,
  nextMonth, prevMonth,
} from '../utils/dateUtils';
import ScheduleModal from './ScheduleModal';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

interface Props {
  schedules: Schedule[];
  onAdd: (s: Omit<Schedule, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, s: Partial<Schedule>) => void;
  onDelete: (id: string) => void;
}

function getSchedulesForDay(schedules: Schedule[], date: Date): Schedule[] {
  const dateStr = toDateString(date);
  return schedules.filter(s => {
    if (s.date === dateStr) return true;
    if (s.repeat === 'daily') return true;
    if (s.repeat === 'weekly' && new Date(s.date).getDay() === date.getDay()) return true;
    if (s.repeat === 'monthly' && new Date(s.date).getDate() === date.getDate()) return true;
    return false;
  });
}

export default function MonthlyView({ schedules, onAdd, onUpdate, onDelete }: Props) {
  const [current, setCurrent] = useState(new Date());
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [editSchedule, setEditSchedule] = useState<Schedule | null>(null);

  const days = getMonthDays(current);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrent(prevMonth(current))} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft size={20} className="text-slate-600" />
        </button>
        <h2 className="text-xl font-bold text-slate-800">
          {formatDate(current, 'yyyy년 M월')}
        </h2>
        <button onClick={() => setCurrent(nextMonth(current))} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronRight size={20} className="text-slate-600" />
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-7">
          {DAY_NAMES.map((d, i) => (
            <div key={d} className={`py-3 text-center text-sm font-semibold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-slate-500'}`}>
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 border-t border-slate-100">
          {days.map((day, idx) => {
            const inMonth = isSameMonth(day, current);
            const today = isToday(day);
            const daySchedules = getSchedulesForDay(schedules, day);
            const isWeekend0 = idx % 7 === 0;
            const isWeekend6 = idx % 7 === 6;

            return (
              <div
                key={day.toISOString()}
                onClick={() => setModalDate(toDateString(day))}
                className={`min-h-[90px] p-1.5 border-b border-r border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${!inMonth ? 'bg-slate-50/50' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                    ${today ? 'bg-blue-500 text-white' : isWeekend0 ? 'text-red-400' : isWeekend6 ? 'text-blue-400' : 'text-slate-700'}
                    ${!inMonth ? 'opacity-40' : ''}
                  `}>
                    {day.getDate()}
                  </span>
                  {inMonth && (
                    <button
                      onClick={e => { e.stopPropagation(); setModalDate(toDateString(day)); }}
                      className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-0.5 hover:bg-slate-200 rounded transition-all"
                    >
                      <Plus size={12} className="text-slate-400" />
                    </button>
                  )}
                </div>
                <div className="space-y-0.5">
                  {daySchedules.slice(0, 3).map(s => (
                    <div
                      key={s.id}
                      onClick={e => { e.stopPropagation(); setEditSchedule(s); }}
                      className="text-xs px-1.5 py-0.5 rounded truncate text-white font-medium cursor-pointer hover:opacity-80"
                      style={{ backgroundColor: s.color }}
                    >
                      {s.startTime && <span className="opacity-80 mr-1">{s.startTime}</span>}
                      {s.title}
                    </div>
                  ))}
                  {daySchedules.length > 3 && (
                    <div className="text-xs text-slate-400 pl-1">+{daySchedules.length - 3}개 더</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {modalDate && !editSchedule && (
        <ScheduleModal
          date={modalDate}
          onSave={onAdd}
          onClose={() => setModalDate(null)}
        />
      )}
      {editSchedule && (
        <ScheduleModal
          schedule={editSchedule}
          onSave={data => onUpdate(editSchedule.id, data)}
          onDelete={() => onDelete(editSchedule.id)}
          onClose={() => setEditSchedule(null)}
        />
      )}
    </div>
  );
}
