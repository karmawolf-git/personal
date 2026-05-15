import { useState } from 'react';
import { Plus, Trash2, Check, Flag, Calendar } from 'lucide-react';
import type { Todo, Priority } from '../types';

interface Props {
  todos: Todo[];
  onAdd: (t: Omit<Todo, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, t: Partial<Todo>) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  high: { label: '높음', color: 'text-red-500', bg: 'bg-red-50 border-red-200' },
  medium: { label: '중간', color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200' },
  low: { label: '낮음', color: 'text-slate-400', bg: 'bg-slate-50 border-slate-200' },
};

export default function TodoView({ todos, onAdd, onUpdate, onDelete }: Props) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [showForm, setShowForm] = useState(false);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd({ text: text.trim(), completed: false, priority, dueDate, category: category.trim() });
    setText('');
    setDueDate('');
    setCategory('');
    setPriority('medium');
    setShowForm(false);
  }

  const filtered = todos
    .filter(t => filter === 'all' ? true : filter === 'done' ? t.completed : !t.completed)
    .filter(t => priorityFilter === 'all' ? true : t.priority === priorityFilter)
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const order: Priority[] = ['high', 'medium', 'low'];
      return order.indexOf(a.priority) - order.indexOf(b.priority);
    });

  const doneCount = todos.filter(t => t.completed).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">할 일</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {doneCount}/{todos.length} 완료
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={16} />
          추가
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
          <input
            autoFocus
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="할 일을 입력하세요"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-1">
              {(['high', 'medium', 'low'] as Priority[]).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    priority === p
                      ? PRIORITY_CONFIG[p].bg + ' ' + PRIORITY_CONFIG[p].color + ' font-medium'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Flag size={10} className="inline mr-1" />
                  {PRIORITY_CONFIG[p].label}
                </button>
              ))}
            </div>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="카테고리"
              className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 w-24"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              취소
            </button>
            <button type="submit" disabled={!text.trim()} className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors">
              추가
            </button>
          </div>
        </form>
      )}

      {/* Progress bar */}
      {todos.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>진행률</span>
            <span>{Math.round((doneCount / todos.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${(doneCount / todos.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'active', 'done'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              filter === f ? 'bg-blue-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {f === 'all' ? '전체' : f === 'active' ? '미완료' : '완료'}
          </button>
        ))}
        <div className="w-px bg-slate-200 mx-1" />
        {(['all', 'high', 'medium', 'low'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              priorityFilter === p
                ? 'bg-slate-700 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {p === 'all' ? '모든 우선순위' : PRIORITY_CONFIG[p].label}
          </button>
        ))}
      </div>

      {/* Todo list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center text-slate-400 py-12 bg-white rounded-2xl border border-slate-100">
            할 일이 없습니다
          </div>
        )}
        {filtered.map(todo => (
          <div
            key={todo.id}
            className={`group bg-white rounded-xl border transition-all ${
              todo.completed ? 'border-slate-100 opacity-60' : 'border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-start gap-3 p-4">
              <button
                onClick={() => onUpdate(todo.id, { completed: !todo.completed })}
                className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                  todo.completed
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-slate-300 hover:border-blue-400'
                }`}
              >
                {todo.completed && <Check size={11} className="text-white" strokeWidth={3} />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${todo.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                  {todo.text}
                </p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className={`text-xs font-medium ${PRIORITY_CONFIG[todo.priority].color}`}>
                    <Flag size={10} className="inline mr-0.5" />
                    {PRIORITY_CONFIG[todo.priority].label}
                  </span>
                  {todo.dueDate && (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar size={10} />
                      {todo.dueDate}
                    </span>
                  )}
                  {todo.category && (
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                      {todo.category}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => onDelete(todo.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-400 transition-all rounded"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
