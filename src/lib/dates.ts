/**
 * All of Nemo's World date math lives here as pure functions.
 *
 * Every function works on *local calendar days*: the time of day and the
 * time zone offset are ignored, so 11:59 PM still counts as "today".
 * Functions take `today` as a parameter instead of reading the clock,
 * which keeps them easy to test.
 */
import {
  addDays,
  addMonths,
  addYears,
  differenceInCalendarDays,
  differenceInMonths,
  differenceInYears,
  format,
  isSameDay,
  startOfDay,
} from 'date-fns';
import { seededPermutation } from './random';

export interface Breakdown {
  years: number;
  months: number;
  days: number;
}

/** Parse "YYYY-MM-DD" as midnight local time (not UTC, which `new Date(str)` would use). */
export function parseLocalDate(iso: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) throw new Error(`Invalid date "${iso}", expected YYYY-MM-DD`);
  const [, y, m, d] = match.map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    throw new Error(`Invalid date "${iso}"`);
  }
  return date;
}

/** Format a Date as "YYYY-MM-DD" using the local calendar day. */
export function toIsoDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/** Whole calendar days from `from` to `to` (negative if `to` is earlier). */
export function daysBetween(from: Date, to: Date): number {
  return differenceInCalendarDays(to, from);
}

/**
 * Years, months and days from `from` to `to`, the way people say ages:
 * born Jul 14 → on Nov 18 that's "4 months, 4 days".
 * When a month is shorter (e.g. starting on Jan 31), the anniversary
 * falls on the month's last day.
 */
export function breakdownBetween(from: Date, to: Date): Breakdown {
  const start = startOfDay(from);
  const end = startOfDay(to);
  if (end < start) return { years: 0, months: 0, days: 0 };

  const totalMonths = differenceInMonths(end, start);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const days = differenceInCalendarDays(end, addMonths(start, totalMonths));
  return { years, months, days };
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** "2 years, 4 months, 4 days". Zero parts are left out; all zero → "0 days". */
export function formatBreakdown({ years, months, days }: Breakdown): string {
  const parts: string[] = [];
  if (years) parts.push(plural(years, 'year'));
  if (months) parts.push(plural(months, 'month'));
  if (days || parts.length === 0) parts.push(plural(days, 'day'));
  return parts.join(', ');
}

/**
 * The next anniversary of `date` on or after `today`.
 * A Feb 29 date is celebrated on Feb 28 in non-leap years.
 * If `today` is before the original date, the original date is returned.
 */
export function nextAnniversary(date: Date, today: Date): Date {
  return findNextAnniversary(date, today).date;
}

function findNextAnniversary(date: Date, today: Date): { date: Date; years: number } {
  const start = startOfDay(date);
  const now = startOfDay(today);
  if (now <= start) return { date: start, years: 0 };

  let years = differenceInYears(now, start);
  let candidate = addYears(start, years);
  if (candidate < now) {
    years += 1;
    candidate = addYears(start, years);
  }
  return { date: candidate, years };
}

/** True when `today` is an anniversary of `date` (not the original date itself). */
export function isAnniversary(date: Date, today: Date): boolean {
  return startOfDay(today) > startOfDay(date) && isSameDay(nextAnniversary(date, today), today);
}

/** Which anniversary the next one is: 1 for the 1st, 2 for the 2nd, … */
export function nextAnniversaryNumber(date: Date, today: Date): number {
  return Math.max(1, findNextAnniversary(date, today).years);
}

/** 1 → "1st", 2 → "2nd", 11 → "11th", 22 → "22nd" */
export function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

/**
 * A rough "dog years" figure using a common rule of thumb:
 * year 1 = 15, year 2 = +9, every year after = +5.
 * Real aging depends on size and breed, so the UI labels this as approximate.
 */
export function approxDogYears(birthday: Date, today: Date): number {
  const humanYears = Math.max(0, daysBetween(birthday, today)) / 365.25;
  let dogYears: number;
  if (humanYears <= 1) dogYears = humanYears * 15;
  else if (humanYears <= 2) dogYears = 15 + (humanYears - 1) * 9;
  else dogYears = 24 + (humanYears - 2) * 5;
  return Math.round(dogYears);
}

/** Day 0 for the photo rotation. Any fixed date works; it just has to never change. */
const PHOTO_EPOCH = new Date(2024, 0, 1);

/**
 * Which photo (0…count-1) to show on `today`.
 * - The same all day, and a different one tomorrow.
 * - Every photo is shown once per cycle of `count` days, in a shuffled order
 *   that changes each cycle.
 * - The same photo is never shown two days in a row (if there are 2+ photos).
 * Returns -1 when there are no photos.
 */
export function photoOfTheDayIndex(count: number, today: Date): number {
  if (count <= 0) return -1;
  const day = Math.max(0, daysBetween(PHOTO_EPOCH, today));
  if (count <= 2) return day % count;

  const cycle = Math.floor(day / count);
  const position = day % count;
  const order = seededPermutation(count, cycle + 1);
  // Avoid a repeat across the boundary between two cycles.
  if (cycle > 0) {
    const previousLast = seededPermutation(count, cycle)[count - 1];
    if (order[0] === previousLast) [order[0], order[1]] = [order[1], order[0]];
  }
  return order[position];
}

export type Repeat = 'none' | 'daily' | 'weekly' | 'monthly';

/**
 * The next date in a repeating schedule after `current`.
 * Monthly repeats stay on the day of the month of `anchor` (the first date in
 * the schedule), so "the 31st" goes Jan 31 → Feb 28 → Mar 31, instead of
 * drifting to the 28th forever.
 */
export function nextRepeatDate(current: Date, repeat: Repeat, anchor: Date = current): Date {
  const day = startOfDay(current);
  switch (repeat) {
    case 'daily':
      return addDays(day, 1);
    case 'weekly':
      return addDays(day, 7);
    case 'monthly': {
      const start = startOfDay(anchor);
      const monthsFromAnchor =
        (day.getFullYear() - start.getFullYear()) * 12 + (day.getMonth() - start.getMonth());
      return addMonths(start, monthsFromAnchor + 1);
    }
    case 'none':
      return day;
  }
}

/**
 * When a repeating item is marked done, the date of the next one:
 * the next date in the schedule, skipped forward to today or later so a
 * missed week of doses doesn't leave a pile of overdue items.
 */
export function nextOccurrenceAfterDone(current: Date, repeat: Repeat, anchor: Date, today: Date): Date {
  const now = startOfDay(today);
  let next = nextRepeatDate(current, repeat, anchor);
  for (let i = 0; next < now && i < 10_000; i++) next = nextRepeatDate(next, repeat, anchor);
  return next;
}
