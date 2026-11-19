import { format } from 'date-fns';
import { parseLocalDate } from './dates';

/** "2026-11-25" → "Wed, Nov 25" (adds the year if it isn't this year) */
export function formatShortDate(iso: string, today: Date): string {
  const date = parseLocalDate(iso);
  return format(date, date.getFullYear() === today.getFullYear() ? 'EEE, MMM d' : 'EEE, MMM d, yyyy');
}

/** "15:30" → "3:30 PM" */
export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  return format(new Date(2000, 0, 1, h, m), 'h:mm a');
}
