import { Calendar, CalendarDays, CheckSquare, FileText } from 'lucide-react';
import type { Tab, Schedule, Todo, Memo } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import MonthlyView from './components/MonthlyView';
import WeeklyView from './components/WeeklyView';
import TodoView from './components/TodoView';
import MemoView from './components/MemoView';

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'monthly', label: '월간', icon: <Calendar size={18} /> },
  { id: 'weekly', label: '주간', icon: <CalendarDays size={18} /> },
  { id: 'todos', label: '할 일', icon: <CheckSquare size={18} /> },
  { id: 'memos', label: '메모', icon: <FileText size={18} /> },
];

export default function App() {
  const [tab, setTab] = useLocalStorage<Tab>('ptm-tab', 'monthly');
  const [schedules, setSchedules] = useLocalStorage<Schedule[]>('ptm-schedules', []);
  const [todos, setTodos] = useLocalStorage<Todo[]>('ptm-todos', []);
  const [memos, setMemos] = useLocalStorage<Memo[]>('ptm-memos', []);

  function addSchedule(data: Omit<Schedule, 'id' | 'createdAt'>) {
    setSchedules(prev => [...prev, { ...data, id: uid(), createdAt: new Date().toISOString() }]);
  }
  function updateSchedule(id: string, data: Partial<Schedule>) {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  }
  function deleteSchedule(id: string) {
    setSchedules(prev => prev.filter(s => s.id !== id));
  }

  function addTodo(data: Omit<Todo, 'id' | 'createdAt'>) {
    setTodos(prev => [...prev, { ...data, id: uid(), createdAt: new Date().toISOString() }]);
  }
  function updateTodo(id: string, data: Partial<Todo>) {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  }
  function deleteTodo(id: string) {
    setTodos(prev => prev.filter(t => t.id !== id));
  }

  function addMemo(data: Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    setMemos(prev => [...prev, { ...data, id: uid(), createdAt: now, updatedAt: now }]);
  }
  function updateMemo(id: string, data: Partial<Memo>) {
    setMemos(prev => prev.map(m => m.id === id ? { ...m, ...data, updatedAt: new Date().toISOString() } : m));
  }
  function deleteMemo(id: string) {
    setMemos(prev => prev.filter(m => m.id !== id));
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">
              <span className="text-blue-500">My</span>Planner
            </h1>
            <nav className="flex gap-1">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tab === t.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t.icon}
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {tab === 'monthly' && (
          <MonthlyView
            schedules={schedules}
            onAdd={addSchedule}
            onUpdate={updateSchedule}
            onDelete={deleteSchedule}
          />
        )}
        {tab === 'weekly' && (
          <WeeklyView
            schedules={schedules}
            onAdd={addSchedule}
            onUpdate={updateSchedule}
            onDelete={deleteSchedule}
          />
        )}
        {tab === 'todos' && (
          <TodoView
            todos={todos}
            onAdd={addTodo}
            onUpdate={updateTodo}
            onDelete={deleteTodo}
          />
        )}
        {tab === 'memos' && (
          <MemoView
            memos={memos}
            onAdd={addMemo}
            onUpdate={updateMemo}
            onDelete={deleteMemo}
          />
        )}
      </main>
    </div>
  );
}
