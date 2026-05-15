import { useState } from 'react';
import { Plus, Pin, Trash2, Search, Tag, X } from 'lucide-react';
import type { Memo } from '../types';

interface Props {
  memos: Memo[];
  onAdd: (m: Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, m: Partial<Memo>) => void;
  onDelete: (id: string) => void;
}

export default function MemoView({ memos, onAdd, onUpdate, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const allTags = Array.from(new Set(memos.flatMap(m => m.tags))).sort();

  const filtered = memos
    .filter(m => {
      const q = search.toLowerCase();
      return !q || m.title.toLowerCase().includes(q) || m.content.toLowerCase().includes(q);
    })
    .filter(m => !selectedTag || m.tags.includes(selectedTag))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  function openNew() {
    setEditId(null);
    setTitle('');
    setContent('');
    setTags([]);
    setTagInput('');
    setShowForm(true);
  }

  function openEdit(memo: Memo) {
    setEditId(memo.id);
    setTitle(memo.title);
    setContent(memo.content);
    setTags(memo.tags);
    setTagInput('');
    setShowForm(true);
  }

  function handleSave() {
    if (!content.trim() && !title.trim()) return;
    if (editId) {
      onUpdate(editId, { title: title.trim(), content: content.trim(), tags });
    } else {
      onAdd({ title: title.trim(), content: content.trim(), tags, pinned: false });
    }
    setShowForm(false);
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  }

  function removeTag(tag: string) {
    setTags(prev => prev.filter(t => t !== tag));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">메모</h2>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={16} />
          메모 추가
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="메모 검색..."
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Tags filter */}
      {allTags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedTag(null)}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
              !selectedTag ? 'bg-blue-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            전체
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                selectedTag === tag ? 'bg-blue-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Tag size={10} />
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Memo form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-blue-200 p-4 space-y-3">
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="제목 (선택)"
            className="w-full text-base font-semibold text-slate-800 border-none outline-none placeholder:text-slate-300"
          />
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="내용을 입력하세요..."
            rows={6}
            className="w-full text-sm text-slate-700 border-none outline-none resize-none placeholder:text-slate-300"
          />
          <div className="border-t border-slate-100 pt-3">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                  <Tag size={9} />
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-blue-800">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="태그 추가 (Enter)"
                className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button onClick={addTag} className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors">
                추가
              </button>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={!content.trim() && !title.trim()}
              className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              저장
            </button>
          </div>
        </div>
      )}

      {/* Memo grid */}
      {filtered.length === 0 && !showForm && (
        <div className="text-center text-slate-400 py-12 bg-white rounded-2xl border border-slate-100">
          메모가 없습니다
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(memo => (
          <div
            key={memo.id}
            onClick={() => openEdit(memo)}
            className={`group bg-white rounded-2xl border cursor-pointer hover:shadow-md transition-all p-4 ${
              memo.pinned ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-slate-800 text-sm truncate flex-1 mr-2">
                {memo.title || '(제목 없음)'}
              </h3>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={e => { e.stopPropagation(); onUpdate(memo.id, { pinned: !memo.pinned }); }}
                  className={`p-1 rounded transition-colors ${memo.pinned ? 'text-amber-500' : 'text-slate-300 hover:text-slate-400 opacity-0 group-hover:opacity-100'}`}
                >
                  <Pin size={13} />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onDelete(memo.id); }}
                  className="p-1 text-slate-300 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500 line-clamp-4 whitespace-pre-wrap leading-relaxed">
              {memo.content}
            </p>
            {memo.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {memo.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-300 mt-2">
              {new Date(memo.updatedAt).toLocaleDateString('ko-KR')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
