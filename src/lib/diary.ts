/**
 * Nemo's Diary: the data shape and rules as pure functions.
 * One entry per calendar day.
 */
import { addDays } from 'date-fns';
import { toIsoDate } from './dates';

export const MOODS = [
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'playful', label: 'Playful', emoji: '🎾' },
  { id: 'sleepy', label: 'Sleepy', emoji: '😴' },
  { id: 'grumpy', label: 'Grumpy', emoji: '😤' },
] as const;

export type Mood = (typeof MOODS)[number]['id'];

export const MAX_WALK_MINUTES = 600;

export interface DiaryEntry {
  id: string;
  /** YYYY-MM-DD, local date. Only one entry per date. */
  date: string;
  /** What Nemo did today. */
  text: string;
  /** Total walking time that day, in whole minutes (0 = no walk). */
  walkMinutes: number;
  mood?: Mood;
  /** "Nemo is in Daycare Today" was ticked. */
  atDaycare?: boolean;
  /**
   * "Nemo is in Boarding" was ticked. There's no way to know how a boarding day
   * went, so a boarding entry has no text, walk or mood.
   */
  boarding?: boolean;
}

export type DiaryInput = Omit<DiaryEntry, 'id'>;

export function moodInfo(id: Mood) {
  return MOODS.find((m) => m.id === id)!;
}

/**
 * Tidy an entry before saving: trim the text and keep walk minutes a whole
 * number from 0 to 600. A boarding day keeps only the date and the boarding
 * flag (Nemo can't be at daycare and boarding on the same day).
 */
export function cleanDiaryInput(input: DiaryInput): DiaryInput {
  if (input.boarding) {
    return { date: input.date, text: '', walkMinutes: 0, mood: undefined, atDaycare: undefined, boarding: true };
  }
  const minutes = Number.isFinite(input.walkMinutes) ? Math.round(input.walkMinutes) : 0;
  return {
    date: input.date,
    text: input.text.trim(),
    walkMinutes: Math.min(MAX_WALK_MINUTES, Math.max(0, minutes)),
    mood: input.mood || undefined,
    atDaycare: input.atDaycare || undefined,
    boarding: undefined,
  };
}

/**
 * Whether the "What did Nemo do today?" text must be filled in. It's optional on
 * daycare days (ticking the box already says something) and not used at all on
 * boarding days.
 */
export function needsNarrative(input: Pick<DiaryInput, 'atDaycare' | 'boarding'>): boolean {
  return !input.atDaycare && !input.boarding;
}

export function findByDate(entries: DiaryEntry[], date: string): DiaryEntry | undefined {
  return entries.find((e) => e.date === date);
}

/** True if a *different* entry already uses this date. */
export function isDateTaken(entries: DiaryEntry[], date: string, exceptId?: string): boolean {
  return entries.some((e) => e.date === date && e.id !== exceptId);
}

/** Add a new entry, or update `editingId` if given. */
export function saveEntry(entries: DiaryEntry[], input: DiaryInput, editingId: string | null, makeId: () => string): DiaryEntry[] {
  const clean = cleanDiaryInput(input);
  if (editingId) return entries.map((e) => (e.id === editingId ? { ...e, ...clean } : e));
  return [...entries, { ...clean, id: makeId() }];
}

export function deleteEntry(entries: DiaryEntry[], id: string): DiaryEntry[] {
  return entries.filter((e) => e.id !== id);
}

export function sortNewestFirst(entries: DiaryEntry[]): DiaryEntry[] {
  return [...entries].sort((a, b) => b.date.localeCompare(a.date));
}

/** Entries whose text, mood, or daycare/boarding tag contains every word of the query (case-insensitive). */
export function searchEntries(entries: DiaryEntry[], query: string): DiaryEntry[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return entries;
  return entries.filter((e) => {
    const haystack = [e.text, e.mood ? moodInfo(e.mood).label : '', e.atDaycare ? 'daycare' : '', e.boarding ? 'boarding' : '']
      .join(' ')
      .toLowerCase();
    return words.every((w) => haystack.includes(w));
  });
}

export interface DayWalk {
  date: string;
  minutes: number;
  hasEntry: boolean;
  /** Nemo was boarding, so his walks that day aren't known. */
  boarding: boolean;
  /** Nemo was at daycare (shown as a gray bar on the chart). */
  atDaycare: boolean;
}

/** Walk minutes for each of the last `days` days, oldest first, ending today. */
export function walksForLastDays(entries: DiaryEntry[], today: Date, days = 7): DayWalk[] {
  return Array.from({ length: days }, (_, i) => {
    const date = toIsoDate(addDays(today, i - (days - 1)));
    const entry = findByDate(entries, date);
    return {
      date,
      minutes: entry?.walkMinutes ?? 0,
      hasEntry: Boolean(entry),
      boarding: Boolean(entry?.boarding),
      atDaycare: Boolean(entry?.atDaycare),
    };
  });
}

export interface WalkStats {
  totalMinutes: number;
  /** Average length of the walks taken (days with 0 minutes don't count). Null if none. */
  averageMinutes: number | null;
  daysWalked: number;
}

export function walkStats(days: DayWalk[]): WalkStats {
  const walked = days.filter((d) => d.minutes > 0);
  const totalMinutes = walked.reduce((sum, d) => sum + d.minutes, 0);
  return {
    totalMinutes,
    averageMinutes: walked.length ? Math.round(totalMinutes / walked.length) : null,
    daysWalked: walked.length,
  };
}

/** 90 → [[1, "hr"], [30, "min"]]; 45 → [[45, "min"]]; 120 → [[2, "hr"]] */
export function minuteParts(minutes: number): [number, string][] {
  if (minutes < 60) return [[minutes, 'min']];
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? [[h, 'hr'], [m, 'min']] : [[h, 'hr']];
}

/** 45 → "45 min", 90 → "1 hr 30 min", 120 → "2 hr" */
export function formatMinutes(minutes: number): string {
  return minuteParts(minutes).map(([n, unit]) => `${n} ${unit}`).join(' ');
}

/** Type check used when loading saved data. */
export function isDiaryEntry(value: unknown): value is DiaryEntry {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(v.date) &&
    typeof v.text === 'string' &&
    typeof v.walkMinutes === 'number' &&
    (v.mood === undefined || MOODS.some((m) => m.id === v.mood)) &&
    (v.atDaycare === undefined || typeof v.atDaycare === 'boolean') &&
    (v.boarding === undefined || typeof v.boarding === 'boolean')
  );
}
