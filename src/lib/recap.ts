import { addDays } from 'date-fns';
import type { RecapEntry } from '../../api/_lib/recap';
import { toIsoDate } from './dates';
import type { DiaryEntry } from './diary';

/** Diary entries from the last 7 days (today included), in the shape /api/recap expects. */
export function entriesForRecap(entries: DiaryEntry[], today: Date): RecapEntry[] {
  const from = toIsoDate(addDays(today, -6));
  const to = toIsoDate(today);
  return entries
    .filter((e) => e.date >= from && e.date <= to)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(({ date, text, walkMinutes, mood }) => ({ date, text, walkMinutes, mood }));
}

/** Ask the server to write Nemo's Week. Throws an Error with a friendly message on failure. */
export async function requestRecap(entries: RecapEntry[]): Promise<string> {
  let response: Response;
  try {
    response = await fetch('/api/recap', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ entries }),
    });
  } catch {
    throw new Error("Couldn't reach the server. Check your connection and try again.");
  }
  const data: unknown = await response.json().catch(() => null);
  const body = (data ?? {}) as { recap?: unknown; error?: unknown };
  if (response.ok && typeof body.recap === 'string') return body.recap;
  throw new Error(typeof body.error === 'string' ? body.error : 'Something went wrong. Please try again.');
}
