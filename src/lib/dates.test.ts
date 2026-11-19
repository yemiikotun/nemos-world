import { describe, expect, it } from 'vitest';
import {
  approxDogYears,
  breakdownBetween,
  daysBetween,
  formatBreakdown,
  isAnniversary,
  nextAnniversary,
  nextAnniversaryNumber,
  nextOccurrenceAfterDone,
  nextRepeatDate,
  ordinal,
  photoOfTheDayIndex,
  parseLocalDate,
  toIsoDate,
} from './dates';

const d = parseLocalDate;
/** A local date-time, e.g. at(2026, 11, 18, 23, 59) = Nov 18 2026, 11:59 PM local. */
const at = (y: number, m: number, day: number, h = 0, min = 0) => new Date(y, m - 1, day, h, min);

describe('parseLocalDate', () => {
  it('parses to local midnight, not UTC', () => {
    const date = d('2024-07-14');
    expect(date.getFullYear()).toBe(2024);
    expect(date.getMonth()).toBe(6);
    expect(date.getDate()).toBe(14);
    expect(date.getHours()).toBe(0);
  });

  it('round-trips through toIsoDate', () => {
    expect(toIsoDate(d('2026-07-25'))).toBe('2026-07-25');
  });

  it('rejects bad input', () => {
    expect(() => d('2026-7-25')).toThrow();
    expect(() => d('2025-02-29')).toThrow(); // not a leap year
    expect(() => d('2026-13-01')).toThrow();
  });
});

describe('daysBetween', () => {
  it('counts calendar days', () => {
    expect(daysBetween(d('2026-07-25'), d('2026-11-18'))).toBe(116);
    expect(daysBetween(d('2026-11-18'), d('2026-11-18'))).toBe(0);
  });

  it('ignores the time of day (late at night is still the same day)', () => {
    expect(daysBetween(d('2026-07-25'), at(2026, 11, 18, 23, 59))).toBe(116);
    expect(daysBetween(d('2026-07-25'), at(2026, 11, 18, 0, 1))).toBe(116);
  });

  it('includes Feb 29 in leap years', () => {
    expect(daysBetween(d('2024-02-28'), d('2024-03-01'))).toBe(2);
    expect(daysBetween(d('2025-02-28'), d('2025-03-01'))).toBe(1);
  });

  it('is negative for dates in the past', () => {
    expect(daysBetween(d('2026-11-18'), d('2026-11-10'))).toBe(-8);
  });
});

describe('breakdownBetween', () => {
  it("matches Nemo's age on 2026-11-18", () => {
    expect(breakdownBetween(d('2024-07-14'), d('2026-11-18'))).toEqual({ years: 2, months: 4, days: 4 });
  });

  it('is exactly whole years on an anniversary', () => {
    expect(breakdownBetween(d('2024-07-14'), d('2026-07-14'))).toEqual({ years: 2, months: 0, days: 0 });
  });

  it('is one day short the day before an anniversary', () => {
    expect(breakdownBetween(d('2024-07-14'), d('2026-07-13'))).toEqual({ years: 1, months: 11, days: 29 });
  });

  it('handles month ends (Jan 31 → end of Feb)', () => {
    expect(breakdownBetween(d('2025-01-31'), d('2025-02-28'))).toEqual({ years: 0, months: 1, days: 0 });
    expect(breakdownBetween(d('2025-01-31'), d('2025-03-01'))).toEqual({ years: 0, months: 1, days: 1 });
  });

  it('handles a Feb 29 start', () => {
    expect(breakdownBetween(d('2024-02-29'), d('2025-02-28'))).toEqual({ years: 1, months: 0, days: 0 });
    expect(breakdownBetween(d('2024-02-29'), d('2028-02-29'))).toEqual({ years: 4, months: 0, days: 0 });
  });

  it('returns zeros when the end is before the start', () => {
    expect(breakdownBetween(d('2026-11-18'), d('2026-11-01'))).toEqual({ years: 0, months: 0, days: 0 });
  });
});

describe('formatBreakdown', () => {
  it('pluralizes and skips zero parts', () => {
    expect(formatBreakdown({ years: 2, months: 4, days: 4 })).toBe('2 years, 4 months, 4 days');
    expect(formatBreakdown({ years: 1, months: 0, days: 1 })).toBe('1 year, 1 day');
    expect(formatBreakdown({ years: 0, months: 3, days: 0 })).toBe('3 months');
    expect(formatBreakdown({ years: 0, months: 0, days: 0 })).toBe('0 days');
  });
});

describe('nextAnniversary / isAnniversary', () => {
  const gotcha = d('2026-07-25');

  it("finds Nemo's next Gotcha Day", () => {
    expect(toIsoDate(nextAnniversary(gotcha, d('2026-11-18')))).toBe('2027-07-25');
    expect(daysBetween(d('2026-11-18'), nextAnniversary(gotcha, d('2026-11-18')))).toBe(249);
    expect(nextAnniversaryNumber(gotcha, d('2026-11-18'))).toBe(1);
  });

  it('returns today when today is the anniversary', () => {
    expect(toIsoDate(nextAnniversary(gotcha, d('2027-07-25')))).toBe('2027-07-25');
    expect(isAnniversary(gotcha, at(2027, 7, 25, 22, 30))).toBe(true);
    expect(nextAnniversaryNumber(gotcha, d('2027-07-25'))).toBe(1);
  });

  it('moves to next year the day after', () => {
    expect(toIsoDate(nextAnniversary(gotcha, d('2027-07-26')))).toBe('2028-07-25');
    expect(isAnniversary(gotcha, d('2027-07-26'))).toBe(false);
    expect(nextAnniversaryNumber(gotcha, d('2027-07-26'))).toBe(2);
  });

  it('does not count the original date as an anniversary', () => {
    expect(isAnniversary(gotcha, d('2026-07-25'))).toBe(false);
  });

  it('returns the original date if it is still in the future', () => {
    expect(toIsoDate(nextAnniversary(gotcha, d('2026-07-01')))).toBe('2026-07-25');
  });

  it('celebrates Feb 29 on Feb 28 in non-leap years', () => {
    const leapDay = d('2024-02-29');
    expect(toIsoDate(nextAnniversary(leapDay, d('2025-01-10')))).toBe('2025-02-28');
    expect(isAnniversary(leapDay, d('2025-02-28'))).toBe(true);
    expect(nextAnniversaryNumber(leapDay, d('2025-02-28'))).toBe(1);
    // In a leap year it's Feb 29 again, not Feb 28.
    expect(isAnniversary(leapDay, d('2028-02-28'))).toBe(false);
    expect(isAnniversary(leapDay, d('2028-02-29'))).toBe(true);
    expect(nextAnniversaryNumber(leapDay, d('2028-02-29'))).toBe(4);
  });

  it("finds Nemo's next birthday", () => {
    const birthday = d('2024-07-14');
    expect(toIsoDate(nextAnniversary(birthday, d('2026-11-18')))).toBe('2027-07-14');
    expect(nextAnniversaryNumber(birthday, d('2026-11-18'))).toBe(3);
  });
});

describe('ordinal', () => {
  it('uses the right suffix', () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 101, 111].map(ordinal)).toEqual([
      '1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd', '23rd', '101st', '111th',
    ]);
  });
});

describe('approxDogYears', () => {
  const birthday = d('2024-07-14');
  it('follows the 15 / 9 / 5 rule of thumb', () => {
    expect(approxDogYears(birthday, d('2024-07-14'))).toBe(0);
    expect(approxDogYears(birthday, d('2025-07-14'))).toBe(15);
    expect(approxDogYears(birthday, d('2026-07-14'))).toBe(24);
    expect(approxDogYears(birthday, d('2028-07-14'))).toBe(34);
  });
});

describe('photoOfTheDayIndex', () => {
  const day = (offset: number) => new Date(2026, 10, 18 + offset);

  it('returns -1 when there are no photos', () => {
    expect(photoOfTheDayIndex(0, day(0))).toBe(-1);
  });

  it('stays the same all day', () => {
    expect(photoOfTheDayIndex(7, at(2026, 11, 18, 0, 1))).toBe(photoOfTheDayIndex(7, at(2026, 11, 18, 23, 59)));
  });

  it('shows every photo once per cycle and never repeats two days in a row', () => {
    for (const count of [1, 2, 3, 4, 7, 12, 30]) {
      const picks = Array.from({ length: count * 40 }, (_, i) => photoOfTheDayIndex(count, day(i)));
      // Every photo appears, and all picks are valid.
      expect(new Set(picks).size).toBe(count);
      // Over any run of `count` days starting on a cycle boundary, each photo shows once.
      const firstBoundary = picks.findIndex((_, i) => i > 0 && (daysSinceEpoch(day(i)) % count === 0));
      const cycle = picks.slice(firstBoundary, firstBoundary + count);
      expect(new Set(cycle).size).toBe(count);
      // No back-to-back repeats.
      if (count > 1) {
        for (let i = 1; i < picks.length; i++) expect(picks[i]).not.toBe(picks[i - 1]);
      }
    }
  });
});

const daysSinceEpoch = (date: Date) => daysBetween(new Date(2024, 0, 1), date);

describe('nextRepeatDate / nextOccurrenceAfterDone', () => {
  it('adds a day or a week', () => {
    expect(toIsoDate(nextRepeatDate(d('2026-12-31'), 'daily'))).toBe('2027-01-01');
    expect(toIsoDate(nextRepeatDate(d('2026-02-25'), 'weekly'))).toBe('2026-03-04');
    expect(toIsoDate(nextRepeatDate(d('2028-02-28'), 'daily'))).toBe('2028-02-29');
  });

  it('keeps monthly repeats on the anchor day', () => {
    const anchor = d('2026-01-31');
    const feb = nextRepeatDate(anchor, 'monthly', anchor);
    const mar = nextRepeatDate(feb, 'monthly', anchor);
    const apr = nextRepeatDate(mar, 'monthly', anchor);
    expect([feb, mar, apr].map(toIsoDate)).toEqual(['2026-02-28', '2026-03-31', '2026-04-30']);
  });

  it('skips forward to today or later', () => {
    expect(toIsoDate(nextOccurrenceAfterDone(d('2026-11-01'), 'daily', d('2026-11-01'), d('2026-11-18')))).toBe('2026-11-18');
    expect(toIsoDate(nextOccurrenceAfterDone(d('2026-11-18'), 'daily', d('2026-11-18'), d('2026-11-18')))).toBe('2026-11-19');
    expect(toIsoDate(nextOccurrenceAfterDone(d('2026-08-15'), 'monthly', d('2026-08-15'), d('2026-11-18')))).toBe('2026-12-15');
  });
});
