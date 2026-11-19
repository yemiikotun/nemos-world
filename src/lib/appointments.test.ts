import { describe, expect, it } from 'vitest';
import {
  createAppointment,
  groupAppointments,
  isAppointment,
  markDone,
  markNotDone,
  relativeDayLabel,
  upNext,
  updateAppointment,
  type Appointment,
  type AppointmentInput,
} from './appointments';
import { parseLocalDate } from './dates';

const today = parseLocalDate('2026-11-18');
let counter = 0;
const makeId = () => `new-${++counter}`;

const input = (overrides: Partial<AppointmentInput> = {}): AppointmentInput => ({
  title: 'Checkup',
  category: 'vet',
  date: '2026-11-20',
  repeat: 'none',
  ...overrides,
});

const make = (id: string, overrides: Partial<AppointmentInput> = {}) => createAppointment(input(overrides), id);

describe('createAppointment', () => {
  it('trims text and drops empty optional fields', () => {
    const a = createAppointment(input({ title: '  Checkup  ', notes: '   ', time: '' }), 'a');
    expect(a).toEqual({ id: 'a', title: 'Checkup', category: 'vet', date: '2026-11-20', repeat: 'none', done: false, time: undefined, notes: undefined, repeatAnchor: undefined });
  });

  it('only lets medication repeat', () => {
    expect(make('a', { category: 'vet', repeat: 'daily' }).repeat).toBe('none');
    const med = make('b', { category: 'medication', repeat: 'monthly', date: '2026-01-31' });
    expect(med.repeat).toBe('monthly');
    expect(med.repeatAnchor).toBe('2026-01-31');
  });
});

describe('updateAppointment', () => {
  it('resets the repeat anchor when the date changes', () => {
    const items = [make('a', { category: 'medication', repeat: 'monthly', date: '2026-01-31' })];
    const updated = updateAppointment(items, 'a', input({ category: 'medication', repeat: 'monthly', date: '2026-02-15' }));
    expect(updated[0].repeatAnchor).toBe('2026-02-15');
  });
});

describe('groupAppointments', () => {
  const items: Appointment[] = [
    make('late', { date: '2026-11-10' }),
    make('today-pm', { date: '2026-11-18', time: '15:00' }),
    make('today-am', { date: '2026-11-18', time: '09:00' }),
    make('today-allday', { date: '2026-11-18' }),
    make('soon', { date: '2026-11-25', category: 'grooming' }),
    { ...make('finished', { date: '2026-11-01' }), done: true },
    { ...make('finished-later', { date: '2026-11-05' }), done: true },
  ];

  it('puts each item in the right section, sorted by date and time', () => {
    const groups = groupAppointments(items, today);
    expect(groups.overdue.map((i) => i.id)).toEqual(['late']);
    expect(groups.today.map((i) => i.id)).toEqual(['today-allday', 'today-am', 'today-pm']);
    expect(groups.upcoming.map((i) => i.id)).toEqual(['soon']);
    expect(groups.done.map((i) => i.id)).toEqual(['finished-later', 'finished']);
  });

  it('filters by category', () => {
    const groups = groupAppointments(items, today, 'grooming');
    expect(groups.upcoming.map((i) => i.id)).toEqual(['soon']);
    expect(groups.overdue).toEqual([]);
    expect(groups.today).toEqual([]);
  });

  it('upNext shows the earliest items that are not done', () => {
    expect(upNext(items, 3).map((i) => i.id)).toEqual(['late', 'today-allday', 'today-am']);
  });
});

describe('markDone / markNotDone', () => {
  it('marks a one-time item done', () => {
    const items = markDone([make('a')], 'a', today, makeId);
    expect(items).toHaveLength(1);
    expect(items[0].done).toBe(true);
  });

  it('schedules the next dose of a daily medication', () => {
    const items = markDone([make('a', { category: 'medication', repeat: 'daily', date: '2026-11-18' })], 'a', today, () => 'next');
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ id: 'a', done: true, nextId: 'next' });
    expect(items[1]).toMatchObject({ id: 'next', date: '2026-11-19', done: false, repeat: 'daily' });
  });

  it('skips ahead past missed doses instead of creating overdue ones', () => {
    const items = markDone([make('a', { category: 'medication', repeat: 'weekly', date: '2026-10-01' })], 'a', today, () => 'next');
    expect(items[1].date).toBe('2026-11-19'); // Oct 1 + 7 weeks; first date on/after Nov 18
  });

  it('keeps monthly doses on the original day of the month', () => {
    let items = [make('a', { category: 'medication', repeat: 'monthly', date: '2026-01-31' })];
    const jan = parseLocalDate('2026-01-31');
    items = markDone(items, 'a', jan, () => 'feb');
    expect(items.find((i) => i.id === 'feb')!.date).toBe('2026-02-28');
    items = markDone(items, 'feb', parseLocalDate('2026-02-28'), () => 'mar');
    expect(items.find((i) => i.id === 'mar')!.date).toBe('2026-03-31');
  });

  it('undo removes the next dose that was created', () => {
    const done = markDone([make('a', { category: 'medication', repeat: 'daily', date: '2026-11-18' })], 'a', today, () => 'next');
    const undone = markNotDone(done, 'a');
    expect(undone).toHaveLength(1);
    expect(undone[0]).toMatchObject({ id: 'a', done: false });
    expect(undone[0].nextId).toBeUndefined();
  });

  it('undo keeps the next dose if it was already done too', () => {
    let items = markDone([make('a', { category: 'medication', repeat: 'daily', date: '2026-11-18' })], 'a', today, () => 'b');
    items = markDone(items, 'b', today, () => 'c');
    items = markNotDone(items, 'a');
    expect(items.map((i) => i.id).sort()).toEqual(['a', 'b', 'c']);
  });
});

describe('relativeDayLabel', () => {
  it('describes dates relative to today', () => {
    expect(relativeDayLabel('2026-11-18', today)).toBe('Today');
    expect(relativeDayLabel('2026-11-19', today)).toBe('Tomorrow');
    expect(relativeDayLabel('2026-11-17', today)).toBe('Yesterday');
    expect(relativeDayLabel('2026-11-25', today)).toBe('In 7 days');
    expect(relativeDayLabel('2026-11-10', today)).toBe('8 days ago');
  });
});

describe('isAppointment', () => {
  it('accepts valid items and rejects broken ones', () => {
    expect(isAppointment(make('a'))).toBe(true);
    expect(isAppointment({ id: 'a', title: 'x' })).toBe(false);
    expect(isAppointment({ ...make('a'), category: 'party' })).toBe(false);
    expect(isAppointment(null)).toBe(false);
  });
});
