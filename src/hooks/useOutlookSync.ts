import { useMsal } from '@azure/msal-react';
import { calendarScopes } from '../config/msalConfig';
import type { Schedule } from '../types';

interface GraphEvent {
  id: string;
  subject: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  body?: { content: string; contentType: string };
  recurrence?: { pattern: { type: string } } | null;
}

function parseDT(dt: string): { date: string; time: string } {
  if (!dt.includes('T')) return { date: dt.slice(0, 10), time: '' };
  const [date, timePart] = dt.split('T');
  return { date, time: timePart.slice(0, 5) };
}

function mapRepeat(ev: GraphEvent): Schedule['repeat'] {
  const type = ev.recurrence?.pattern?.type?.toLowerCase();
  if (!type) return 'none';
  if (type === 'daily') return 'daily';
  if (type === 'weekly') return 'weekly';
  if (type.includes('monthly')) return 'monthly';
  return 'none';
}

function mapEvent(ev: GraphEvent): Omit<Schedule, 'id' | 'createdAt'> {
  const start = parseDT(ev.start.dateTime);
  const end = parseDT(ev.end.dateTime);
  return {
    title: ev.subject || '(제목 없음)',
    date: start.date,
    startTime: start.time,
    endTime: end.time,
    color: '#3b82f6',
    description: ev.body?.contentType === 'text' ? ev.body.content.trim() : '',
    repeat: mapRepeat(ev),
  };
}

export function useOutlookSync() {
  const { instance, accounts } = useMsal();
  const isLoggedIn = accounts.length > 0;
  const userName = accounts[0]?.name ?? accounts[0]?.username ?? '';

  async function getToken(): Promise<string> {
    const req = { scopes: calendarScopes, account: accounts[0] };
    const result = await instance
      .acquireTokenSilent(req)
      .catch(() => instance.acquireTokenPopup(req));
    return result.accessToken;
  }

  async function login() {
    await instance.loginPopup({ scopes: calendarScopes });
  }

  async function logout() {
    await instance.logoutPopup({ account: accounts[0] });
  }

  async function fetchEvents(
    startDate: string,
    endDate: string,
  ): Promise<Omit<Schedule, 'id' | 'createdAt'>[]> {
    const token = await getToken();
    const params = new URLSearchParams({
      startDateTime: `${startDate}T00:00:00Z`,
      endDateTime: `${endDate}T23:59:59Z`,
      $select: 'subject,start,end,body,recurrence',
      $top: '200',
    });
    const res = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendarView?${params}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) throw new Error('Outlook 일정을 불러오지 못했습니다.');
    const { value } = (await res.json()) as { value: GraphEvent[] };
    return value.map(mapEvent);
  }

  async function pushEvent(schedule: Omit<Schedule, 'id' | 'createdAt'>): Promise<void> {
    const token = await getToken();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const body = {
      subject: schedule.title,
      start: {
        dateTime: schedule.startTime
          ? `${schedule.date}T${schedule.startTime}:00`
          : `${schedule.date}T00:00:00`,
        timeZone: tz,
      },
      end: {
        dateTime: schedule.endTime
          ? `${schedule.date}T${schedule.endTime}:00`
          : schedule.startTime
          ? `${schedule.date}T${schedule.startTime}:00`
          : `${schedule.date}T23:59:00`,
        timeZone: tz,
      },
      ...(schedule.description && {
        body: { contentType: 'text', content: schedule.description },
      }),
    };
    const res = await fetch('https://graph.microsoft.com/v1.0/me/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Outlook에 일정을 추가하지 못했습니다.');
  }

  return { isLoggedIn, userName, login, logout, fetchEvents, pushEvent };
}
