import { useState } from 'react';
import { X, Download, Upload, LogOut, AlertCircle, Loader2 } from 'lucide-react';
import { CLIENT_ID } from '../config/msalConfig';
import { useOutlookSync } from '../hooks/useOutlookSync';
import type { Schedule } from '../types';

interface Props {
  schedules: Schedule[];
  onImport: (events: Omit<Schedule, 'id' | 'createdAt'>[]) => void;
  onClose: () => void;
}

const todayStr = new Date().toISOString().split('T')[0];
const nextMonthStr = new Date(
  new Date().setMonth(new Date().getMonth() + 1),
).toISOString().split('T')[0];

export default function OutlookSync({ schedules, onImport, onClose }: Props) {
  const { isLoggedIn, userName, login, logout, fetchEvents, pushEvent } = useOutlookSync();
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(nextMonthStr);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  async function run(fn: () => Promise<void>) {
    setLoading(true);
    setStatus(null);
    try {
      await fn();
    } finally {
      setLoading(false);
    }
  }

  function handleLogin() {
    return run(async () => {
      try {
        await login();
      } catch {
        setStatus({ ok: false, msg: '로그인에 실패했습니다. 팝업이 차단됐을 수 있습니다.' });
      }
    });
  }

  function handleImport() {
    return run(async () => {
      try {
        const events = await fetchEvents(startDate, endDate);
        onImport(events);
        setStatus({ ok: true, msg: `${events.length}개 일정을 가져왔습니다.` });
      } catch (e) {
        setStatus({ ok: false, msg: e instanceof Error ? e.message : '가져오기 실패' });
      }
    });
  }

  function handleExport() {
    return run(async () => {
      try {
        const toExport = schedules.filter(s => s.date >= startDate && s.date <= endDate);
        if (toExport.length === 0) {
          setStatus({ ok: false, msg: '선택한 날짜 범위에 내보낼 일정이 없습니다.' });
          return;
        }
        await Promise.all(toExport.map(s => pushEvent(s)));
        setStatus({ ok: true, msg: `${toExport.length}개 일정을 Outlook에 내보냈습니다.` });
      } catch (e) {
        setStatus({ ok: false, msg: e instanceof Error ? e.message : '내보내기 실패' });
      }
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Outlook 동기화</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!CLIENT_ID ? (
            <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 space-y-2">
                <p className="font-semibold">Azure 앱 등록이 필요합니다</p>
                <ol className="list-decimal list-inside space-y-1 text-xs leading-relaxed">
                  <li>Azure Portal → 앱 등록 → 새 등록</li>
                  <li>지원 계정: 모든 조직 + 개인 Microsoft 계정</li>
                  <li>리디렉션 URI: 이 사이트 주소 (플랫폼: SPA)</li>
                  <li>API 권한 → Microsoft Graph → <strong>Calendars.ReadWrite</strong></li>
                  <li>개요에서 클라이언트 ID 복사</li>
                </ol>
                <div className="mt-2 p-2 bg-amber-100 rounded-lg font-mono text-xs">
                  VITE_AZURE_CLIENT_ID = &lt;복사한 ID&gt;
                </div>
                <p className="text-xs">위 환경 변수를 Netlify 사이트 설정에 추가하고 재배포하세요.</p>
              </div>
            </div>
          ) : !isLoggedIn ? (
            <div className="text-center py-6 space-y-4">
              <p className="text-sm text-slate-500">
                Microsoft 계정으로 로그인하여<br />Outlook 캘린더와 동기화하세요.
              </p>
              <button
                onClick={handleLogin}
                disabled={loading}
                className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-[#0078d4] text-white text-sm font-medium rounded-lg hover:bg-[#106ebe] transition-colors disabled:opacity-50"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                Microsoft 계정으로 로그인
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-3 py-2.5 bg-blue-50 rounded-xl">
                <div>
                  <p className="text-xs text-blue-500 font-medium">로그인됨</p>
                  <p className="text-sm text-blue-800 font-semibold">{userName}</p>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <LogOut size={12} />
                  로그아웃
                </button>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">날짜 범위</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">시작</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">종료</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleImport}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                  Outlook에서 가져오기
                </button>
                <button
                  onClick={handleExport}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                  Outlook으로 내보내기
                </button>
              </div>
            </div>
          )}

          {status && (
            <div
              className={`p-3 rounded-xl text-sm font-medium ${
                status.ok
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-600'
              }`}
            >
              {status.msg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
