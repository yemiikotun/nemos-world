import { describe, expect, it } from 'vitest';
import { entriesForRecap } from './recap';
import { parseLocalDate } from './dates';

describe('entriesForRecap', () => {
  it('keeps only the last 7 days, oldest first, without ids', () => {
    const entries = [
      { id: 'a', date: '2026-11-18', text: 'Today', walkMinutes: 30, mood: 'happy' as const },
      { id: 'b', date: '2026-11-12', text: 'Six days ago', walkMinutes: 10 },
      { id: 'c', date: '2026-11-11', text: 'Too old', walkMinutes: 20 },
    ];
    expect(entriesForRecap(entries, parseLocalDate('2026-11-18'))).toEqual([
      { date: '2026-11-12', text: 'Six days ago', walkMinutes: 10, mood: undefined },
      { date: '2026-11-18', text: 'Today', walkMinutes: 30, mood: 'happy' },
    ]);
  });
});
