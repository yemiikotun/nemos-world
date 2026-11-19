/**
 * Appointments & medication: the data shape and all the rules, as pure
 * functions (no React, no storage) so they're easy to test.
 */
import { daysBetween, nextOccurrenceAfterDone, parseLocalDate, toIsoDate, type Repeat } from './dates';

export const CATEGORIES = [
  { id: 'vet', label: 'Vet', emoji: '🩺' },
  { id: 'medication', label: 'Medication', emoji: '💊' },
  { id: 'grooming', label: 'Grooming', emoji: '✂️' },
  { id: 'vaccination', label: 'Vaccination', emoji: '💉' },
  { id: 'other', label: 'Other', emoji: '📌' },
] as const;

export type Category = (typeof CATEGORIES)[number]['id'];

export const REPEAT_LABELS: Record<Repeat, string> = {
  none: "Doesn't repeat",
  daily: 'Every day',
  weekly: 'Every week',
  monthly: 'Every month',
};

export interface Appointment {
  id: string;
  title: string;
  category: Category;
  /** YYYY-MM-DD, local date */
  date: string;
  /** HH:mm (24-hour), optional */
  time?: string;
  notes?: string;
  /** Only medication can repeat. */
  repeat: Repeat;
  /** First date of a repeating schedule; keeps monthly repeats on the right day. */
  repeatAnchor?: string;
  done: boolean;
  /** When a repeating item is marked done, the id of the next one it created. */
  nextId?: string;
}

/** The fields a person fills in on the form. */
export type AppointmentInput = Pick<Appointment, 'title' | 'category' | 'date' | 'time' | 'notes' | 'repeat'>;

export function categoryInfo(id: Category) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}

export function canRepeat(category: Category): boolean {
  return category === 'medication';
}

/** Tidy up form input: trim text, drop empty optional fields, only medication repeats. */
export function cleanInput(input: AppointmentInput): AppointmentInput {
  const notes = input.notes?.trim();
  return {
    title: input.title.trim(),
    category: input.category,
    date: input.date,
    time: input.time || undefined,
    notes: notes || undefined,
    repeat: canRepeat(input.category) ? input.repeat : 'none',
  };
}

export function createAppointment(input: AppointmentInput, id: string): Appointment {
  const clean = cleanInput(input);
  return {
    ...clean,
    id,
    done: false,
    repeatAnchor: clean.repeat === 'none' ? undefined : clean.date,
  };
}

export function updateAppointment(items: Appointment[], id: string, input: AppointmentInput): Appointment[] {
  return items.map((item) => {
    if (item.id !== id) return item;
    const clean = cleanInput(input);
    const scheduleChanged = clean.repeat !== item.repeat || clean.date !== item.date;
    return {
      ...item,
      ...clean,
      repeatAnchor: clean.repeat === 'none' ? undefined : scheduleChanged ? clean.date : item.repeatAnchor,
    };
  });
}

export function deleteAppointment(items: Appointment[], id: string): Appointment[] {
  return items.filter((item) => item.id !== id);
}

/**
 * Mark an item done. A repeating item also schedules its next occurrence
 * (on or after today), using `makeId` for the new item's id.
 */
export function markDone(items: Appointment[], id: string, today: Date, makeId: () => string): Appointment[] {
  const item = items.find((i) => i.id === id);
  if (!item || item.done) return items;

  if (item.repeat === 'none') {
    return items.map((i) => (i.id === id ? { ...i, done: true } : i));
  }

  const anchor = parseLocalDate(item.repeatAnchor ?? item.date);
  const nextDate = nextOccurrenceAfterDone(parseLocalDate(item.date), item.repeat, anchor, today);
  const next: Appointment = { ...item, id: makeId(), date: toIsoDate(nextDate), done: false, nextId: undefined };
  return [...items.map((i) => (i.id === id ? { ...i, done: true, nextId: next.id } : i)), next];
}

/** Undo "done". For a repeating item, removes the next occurrence it created (unless that one is done too). */
export function markNotDone(items: Appointment[], id: string): Appointment[] {
  const item = items.find((i) => i.id === id);
  if (!item || !item.done) return items;
  const spawned = items.find((i) => i.id === item.nextId);
  return items
    .filter((i) => !(spawned && i.id === spawned.id && !spawned.done))
    .map((i) => (i.id === id ? { ...i, done: false, nextId: undefined } : i));
}

/** Sort by date, then time. Items without a time count as "all day" and come first. */
export function compareAppointments(a: Appointment, b: Appointment): number {
  return a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? '') || a.title.localeCompare(b.title);
}

export interface AppointmentGroups {
  overdue: Appointment[];
  today: Appointment[];
  upcoming: Appointment[];
  done: Appointment[];
}

/** Split items into the four sections shown on the page. */
export function groupAppointments(items: Appointment[], today: Date, category: Category | 'all' = 'all'): AppointmentGroups {
  const todayIso = toIsoDate(today);
  const groups: AppointmentGroups = { overdue: [], today: [], upcoming: [], done: [] };
  for (const item of [...items].sort(compareAppointments)) {
    if (category !== 'all' && item.category !== category) continue;
    if (item.done) groups.done.push(item);
    else if (item.date < todayIso) groups.overdue.push(item);
    else if (item.date === todayIso) groups.today.push(item);
    else groups.upcoming.push(item);
  }
  groups.done.reverse(); // most recent first
  return groups;
}

/** The next few items that aren't done (overdue ones first), for the Home page. */
export function upNext(items: Appointment[], limit = 3): Appointment[] {
  return items.filter((i) => !i.done).sort(compareAppointments).slice(0, limit);
}

/** "Today", "Tomorrow", "In 5 days", "Yesterday", "3 days overdue" */
export function relativeDayLabel(dateIso: string, today: Date): string {
  const diff = daysBetween(today, parseLocalDate(dateIso));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 1) return `In ${diff} days`;
  return `${-diff} days ago`;
}

/** Type check used when loading saved data. */
export function isAppointment(value: unknown): value is Appointment {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.title === 'string' &&
    typeof v.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(v.date) &&
    CATEGORIES.some((c) => c.id === v.category) &&
    ['none', 'daily', 'weekly', 'monthly'].includes(v.repeat as string) &&
    typeof v.done === 'boolean'
  );
}
