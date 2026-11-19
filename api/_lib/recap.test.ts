import { describe, expect, it } from 'vitest';
import { buildRecapPrompt, createRateLimiter, validateRecapRequest, type RecapEntry } from './recap';

const entry = (date: string, walkMinutes = 30, text = 'Played fetch.', mood?: string) => ({ date, text, walkMinutes, mood });

describe('validateRecapRequest', () => {
  it('accepts a normal week and sorts it oldest first', () => {
    const result = validateRecapRequest({ entries: [entry('2026-11-18', 35, 'Park', 'playful'), entry('2026-11-16', 0)] });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.entries.map((e) => e.date)).toEqual(['2026-11-16', '2026-11-18']);
  });

  it('rejects bad input instead of trimming it', () => {
    const bad = [
      null,
      {},
      { entries: [] },
      { entries: Array.from({ length: 8 }, (_, i) => entry(`2026-11-${10 + i}`)) },
      { entries: [entry('18/11/2026')] },
      { entries: [entry('2026-11-18'), entry('2026-11-18')] },
      { entries: [entry('2026-11-18', 30, '   ')] },
      { entries: [entry('2026-11-18', 30, 'x'.repeat(4001))] },
      { entries: [entry('2026-11-18', -5)] },
      { entries: [entry('2026-11-18', 12.5)] },
      { entries: [entry('2026-11-18', 30, 'ok', 'angry')] },
    ];
    for (const body of bad) expect(validateRecapRequest(body).ok).toBe(false);
  });
});

describe('buildRecapPrompt', () => {
  it('includes each entry, the weekday, and the walk totals', () => {
    const prompt = buildRecapPrompt([entry('2026-11-16', 55, 'River walk', 'sleepy'), entry('2026-11-17', 0, 'Rainy day')] as RecapEntry[]);
    expect(prompt).toContain('Walk totals: 55 minutes over 1 day.');
    expect(prompt).toContain('date="2026-11-16" day="Monday" walk_minutes="55" mood="sleepy"');
    expect(prompt).toContain('River walk');
    expect(prompt).toContain('day="Tuesday"');
  });
});

describe('createRateLimiter', () => {
  it('allows a few requests per window, per visitor', () => {
    const allow = createRateLimiter(2, 1000);
    expect([allow('a', 0), allow('a', 10), allow('a', 20)]).toEqual([true, true, false]);
    expect(allow('b', 20)).toBe(true);
    expect(allow('a', 1500)).toBe(true);
  });
});
