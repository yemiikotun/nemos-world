import { describe, expect, it } from 'vitest';
import {
  cleanDiaryInput,
  deleteEntry,
  formatMinutes,
  isDateTaken,
  isDiaryEntry,
  needsNarrative,
  saveEntry,
  searchEntries,
  sortNewestFirst,
  walkStats,
  walksForLastDays,
  type DiaryEntry,
} from './diary';
import { parseLocalDate } from './dates';

const today = parseLocalDate('2026-11-18');
const entry = (id: string, date: string, walkMinutes: number, text = 'A good day', mood?: DiaryEntry['mood']): DiaryEntry => ({
  id, date, walkMinutes, text, mood,
});

const entries = [
  entry('a', '2026-11-18', 30, 'Chased a squirrel at the park', 'playful'),
  entry('b', '2026-11-16', 45, 'Long nap, then a walk by the river', 'sleepy'),
  entry('c', '2026-11-12', 0, 'Rainy day, stayed inside', 'grumpy'),
  entry('d', '2026-11-10', 20, 'Vet visit, got a treat'),
];

describe('cleanDiaryInput', () => {
  it('trims text and clamps walk minutes', () => {
    expect(cleanDiaryInput({ date: '2026-11-18', text: '  hi  ', walkMinutes: 12.6, mood: undefined })).toEqual({
      date: '2026-11-18', text: 'hi', walkMinutes: 13, mood: undefined,
    });
    expect(cleanDiaryInput({ date: '2026-11-18', text: 'x', walkMinutes: -5 }).walkMinutes).toBe(0);
    expect(cleanDiaryInput({ date: '2026-11-18', text: 'x', walkMinutes: 9999 }).walkMinutes).toBe(600);
    expect(cleanDiaryInput({ date: '2026-11-18', text: 'x', walkMinutes: NaN }).walkMinutes).toBe(0);
  });
});

describe('saving entries', () => {
  it('adds a new entry', () => {
    const result = saveEntry([], { date: '2026-11-18', text: 'Hi', walkMinutes: 10 }, null, () => 'new');
    expect(result).toEqual([{ id: 'new', date: '2026-11-18', text: 'Hi', walkMinutes: 10, mood: undefined }]);
  });

  it('updates an existing entry', () => {
    const result = saveEntry(entries, { date: '2026-11-18', text: 'Changed', walkMinutes: 50, mood: 'happy' }, 'a', () => 'x');
    expect(result.find((e) => e.id === 'a')).toMatchObject({ text: 'Changed', walkMinutes: 50, mood: 'happy' });
    expect(result).toHaveLength(entries.length);
  });

  it('allows only one entry per date', () => {
    expect(isDateTaken(entries, '2026-11-18')).toBe(true);
    expect(isDateTaken(entries, '2026-11-18', 'a')).toBe(false); // editing that same entry is fine
    expect(isDateTaken(entries, '2026-11-17')).toBe(false);
  });

  it('deletes', () => {
    expect(deleteEntry(entries, 'a').map((e) => e.id)).toEqual(['b', 'c', 'd']);
  });

  it('sorts newest first', () => {
    expect(sortNewestFirst([entries[3], entries[0], entries[2]]).map((e) => e.id)).toEqual(['a', 'c', 'd']);
  });
});

describe('searchEntries', () => {
  it('matches words in any order, ignoring case', () => {
    expect(searchEntries(entries, 'PARK').map((e) => e.id)).toEqual(['a']);
    expect(searchEntries(entries, 'walk river').map((e) => e.id)).toEqual(['b']);
    expect(searchEntries(entries, 'river squirrel')).toEqual([]);
  });

  it('matches the mood', () => {
    expect(searchEntries(entries, 'grumpy').map((e) => e.id)).toEqual(['c']);
  });

  it('returns everything for an empty query', () => {
    expect(searchEntries(entries, '   ')).toHaveLength(4);
  });
});

describe('walks for the last 7 days', () => {
  const days = walksForLastDays(entries, today);

  it('covers the 7 days ending today, oldest first', () => {
    expect(days.map((d) => d.date)).toEqual([
      '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15', '2026-11-16', '2026-11-17', '2026-11-18',
    ]);
    expect(days.map((d) => d.minutes)).toEqual([0, 0, 0, 0, 45, 0, 30]);
    expect(days.map((d) => d.hasEntry)).toEqual([true, false, false, false, true, false, true]);
  });

  it('crosses month boundaries', () => {
    expect(walksForLastDays([], parseLocalDate('2026-03-02')).map((d) => d.date)[0]).toBe('2026-02-24');
  });

  it('totals and averages only days with a walk', () => {
    expect(walkStats(days)).toEqual({ totalMinutes: 75, averageMinutes: 38, daysWalked: 2 });
    expect(walkStats(walksForLastDays([], today))).toEqual({ totalMinutes: 0, averageMinutes: null, daysWalked: 0 });
  });
});

describe('formatMinutes', () => {
  it('formats minutes and hours', () => {
    expect([0, 45, 60, 90, 125].map(formatMinutes)).toEqual(['0 min', '45 min', '1 hr', '1 hr 30 min', '2 hr 5 min']);
  });
});

describe('isDiaryEntry', () => {
  it('accepts valid entries and rejects broken ones', () => {
    expect(isDiaryEntry(entries[0])).toBe(true);
    expect(isDiaryEntry({ ...entries[0], mood: 'angry' })).toBe(false);
    expect(isDiaryEntry({ ...entries[0], walkMinutes: '30' })).toBe(false);
    expect(isDiaryEntry(undefined)).toBe(false);
  });
});

describe('daycare and boarding days', () => {
  it('keeps the narrative, walk and mood on a daycare day', () => {
    const clean = cleanDiaryInput({ date: '2026-11-20', text: ' Played with Max ', walkMinutes: 20, mood: 'happy', atDaycare: true });
    expect(clean).toMatchObject({ text: 'Played with Max', walkMinutes: 20, mood: 'happy', atDaycare: true });
    expect(clean.boarding).toBeUndefined();
  });

  it('clears the narrative, walk, mood and daycare on a boarding day', () => {
    const clean = cleanDiaryInput({ date: '2026-11-21', text: 'leftover text', walkMinutes: 40, mood: 'sleepy', atDaycare: true, boarding: true });
    expect(clean).toEqual({ date: '2026-11-21', text: '', walkMinutes: 0, mood: undefined, atDaycare: undefined, boarding: true });
  });

  it('only requires the narrative on a regular day', () => {
    expect(needsNarrative({})).toBe(true);
    expect(needsNarrative({ atDaycare: true })).toBe(false);
    expect(needsNarrative({ boarding: true })).toBe(false);
  });

  it('turning boarding off again when editing removes the flag', () => {
    const boarded = saveEntry([], { date: '2026-11-21', text: '', walkMinutes: 0, boarding: true }, null, () => 'b');
    const edited = saveEntry(boarded, { date: '2026-11-21', text: 'Home early!', walkMinutes: 15 }, 'b', () => 'x');
    expect(edited[0]).toMatchObject({ text: 'Home early!', walkMinutes: 15 });
    expect(edited[0].boarding).toBeUndefined();
  });

  it('can be found by searching "daycare" or "boarding"', () => {
    const list = [
      entry('d', '2026-11-20', 10, 'Fun day', undefined),
      { ...entry('e', '2026-11-19', 10, 'Fun day'), atDaycare: true },
      { ...entry('f', '2026-11-18', 0, ''), boarding: true },
    ];
    expect(searchEntries(list, 'daycare').map((e) => e.id)).toEqual(['e']);
    expect(searchEntries(list, 'boarding').map((e) => e.id)).toEqual(['f']);
  });

  it('marks boarding days in the 7-day walk data', () => {
    const days = walksForLastDays([{ ...entry('f', '2026-11-17', 0, ''), boarding: true }], today);
    expect(days.find((d) => d.date === '2026-11-17')).toEqual({ date: '2026-11-17', minutes: 0, hasEntry: true, boarding: true });
    expect(days.find((d) => d.date === '2026-11-18')?.boarding).toBe(false);
  });

  it('accepts saved entries with or without the new fields, and rejects bad values', () => {
    expect(isDiaryEntry({ ...entries[0], atDaycare: true })).toBe(true);
    expect(isDiaryEntry({ ...entries[0], boarding: false })).toBe(true);
    expect(isDiaryEntry({ ...entries[0], boarding: 'yes' })).toBe(false);
  });
});
