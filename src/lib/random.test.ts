import { describe, expect, it } from 'vitest';
import { pickDifferentIndex, seededPermutation, seededRandom } from './random';

describe('seededRandom', () => {
  it('repeats for the same seed', () => {
    const a = seededRandom(42);
    const b = seededRandom(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});

describe('seededPermutation', () => {
  it('contains every index exactly once', () => {
    const order = seededPermutation(20, 7);
    expect([...order].sort((x, y) => x - y)).toEqual(Array.from({ length: 20 }, (_, i) => i));
  });

  it('is the same for the same seed and different for another', () => {
    expect(seededPermutation(20, 7)).toEqual(seededPermutation(20, 7));
    expect(seededPermutation(20, 7)).not.toEqual(seededPermutation(20, 8));
  });
});

describe('pickDifferentIndex', () => {
  it('never returns the current index', () => {
    for (let current = 0; current < 5; current++) {
      for (const r of [0, 0.2, 0.5, 0.99]) {
        const pick = pickDifferentIndex(5, current, () => r);
        expect(pick).not.toBe(current);
        expect(pick).toBeGreaterThanOrEqual(0);
        expect(pick).toBeLessThan(5);
      }
    }
  });

  it('returns the current index when there is only one photo', () => {
    expect(pickDifferentIndex(1, 0)).toBe(0);
  });
});
