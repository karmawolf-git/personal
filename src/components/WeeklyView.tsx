import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Schedule } from '../types';
import {
  getWeekDays, formatDate, isToday, toDateString,
  nextWeek, prevWeek,
} from '../utils/dateUtils';
import ScheduleModal from './ScheduleModal';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
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
    const [y, m, d] = s.date.split('-').map(Number);
    const schedDate = new Date(y, m - 1, d);
    if (s.repeat === 'weekly' && schedDate.getDay() === date.getDay()) return true;
    if (s.repeat === 'monthly' && schedDate.getDate() === date.getDate()) return true;
    return false;
  });
}

export default function WeeklyView({ schedules, onAdd, onUpdate, onDelete }: Props) {
  const [current, setCurrent] = useState(new Date());
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [editSchedule, setEditSchedule] = useState<Schedule | null>(null);

  const days = getWeekDays(current);
  const weekLabel = `${formatDate(days[0], 'M월 d일')} – ${formatDate(days[6], 'M월 d일')}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrent(prevWeek(current))} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft size={20} className="text-slate-600" />
        </button>
        <h2 className="text-xl font-bold text-slate-800">{weekLabel}</h2>
        <button onClick={() => setCurrent(nextWeek(current))} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronRight size={20} className="text-slate-600" />
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="grid border-b border-slate-100" style={{ gridTemplateColumns: '50px repeat(7, 1fr)' }}>
          <div className="py-3" />
          {days.map((day, i) => {
            const today = isToday(day);
            return (
              <div key={day.toISOString()} className="py-3 text-center">
                <div className={`text-xs font-medium ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-500'}`}>
                  {DAY_NAMES[i]}
                </div>
                <div className={`mt-1 w-8 h-8 flex items-center justify-center rounded-full mx-auto text-sm font-semibold
                  ${today ? 'bg-blue-500 text-white' : i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-slate-800'}
                `}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* All-day schedules (no time) */}
        {days.some(day => getSchedulesForDay(schedules, day).some(s => !s.startTime)) && (
          <div className="grid border-b border-slate-100 bg-slate-50" style={{ gridTemplateColumns: '50px repeat(7, 1fr)' }}>
            <div className="py-2 text-xs text-slate-400 text-center flex items-center justify-center">종일</div>
            {days.map(day => {
              const allDay = getSchedulesForDay(schedules, day).filter(s => !s.startTime);
              return (
                <div key={day.toISOString()} className="py-1 px-0.5 space-y-0.5">
                  {allDay.map(s => (
                    <div
                      key={s.id}
                      onClick={() => setEditSchedule(s)}
                      className="text-xs px-1 py-0.5 rounded truncate text-white cursor-pointer hover:opacity-80"
                      style={{ backgroundColor: s.color }}
                    >
                      {s.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* Time grid */}
        <div className="overflow-y-auto max-h-[600px]">
          {HOURS.map(hour => (
            <div key={hour} className="grid border-b border-slate-50 hover:bg-slate-50/50" style={{ gridTemplateColumns: '50px repeat(7, 1fr)', minHeight: '56px' }}>
              <div className="py-1 pr-2 text-right text-xs text-slate-400 sticky left-0 bg-white">
                {hour === 0 ? '' : `${hour}:00`}
              </div>
              {days.map(day => {
                const timed = getSchedulesForDay(schedules, day).filter(s => {
                  if (!s.startTime) return false;
                  const h = parseInt(s.startTime.split(':')[0]);
                  return h === hour;
                });
                return (
                  <div
                    key={day.toISOString()}
                    className="border-l border-slate-100 p-0.5 cursor-pointer"
                    onClick={() => setModalDate(toDateString(day))}
                  >
                    {timed.map(s => (
                      <div
                        key={s.id}
                        onClick={e => { e.stopPropagation(); setEditSchedule(s); }}
                        className="text-xs px-1 py-0.5 rounded text-white mb-0.5 cursor-pointer hover:opacity-80 truncate"
                        style={{ backgroundColor: s.color }}
                      >
                        {s.startTime} {s.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
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
