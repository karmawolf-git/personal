import { useState } from 'react';
import { X } from 'lucide-react';
import type { Schedule, RepeatType } from '../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

interface Props {
  date?: string;
  schedule?: Schedule;
  onSave: (s: Omit<Schedule, 'id' | 'createdAt'>) => void;
  onClose: () => void;
  onDelete?: () => void;
}

export default function ScheduleModal({ date, schedule, onSave, onClose, onDelete }: Props) {
  const [title, setTitle] = useState(schedule?.title ?? '');
  const [selectedDate, setSelectedDate] = useState(schedule?.date ?? date ?? '');
  const [startTime, setStartTime] = useState(schedule?.startTime ?? '');
  const [endTime, setEndTime] = useState(schedule?.endTime ?? '');
  const [color, setColor] = useState(schedule?.color ?? COLORS[0]);
  const [description, setDescription] = useState(schedule?.description ?? '');
  const [repeat, setRepeat] = useState<RepeatType>(schedule?.repeat ?? 'none');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !selectedDate) return;
    onSave({ title: title.trim(), date: selectedDate, startTime, endTime, color, description, repeat });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            {schedule ? '일정 수정' : '새 일정'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">제목 *</label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="일정 제목"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">날짜 *</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">시작 시간</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">종료 시간</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">색상</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                  style={{ backgroundColor: c, outline: color === c ? `3px solid ${c}` : undefined, outlineOffset: '2px' }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">반복</label>
            <select
              value={repeat}
              onChange={e => setRepeat(e.target.value as RepeatType)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="none">반복 없음</option>
              <option value="daily">매일</option>
              <option value="weekly">매주</option>
              <option value="monthly">매월</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">메모</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="추가 메모..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>
          <div className="flex gap-2 pt-1">
            {onDelete && (
              <button
                type="button"
                onClick={() => { onDelete(); onClose(); }}
                className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                삭제
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors ml-auto"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !selectedDate}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
