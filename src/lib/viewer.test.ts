import { describe, expect, it } from 'vitest';
import { stepIndex, swipeDirection } from './viewer';

describe('stepIndex', () => {
  it('moves forward and back, wrapping at the ends', () => {
    expect(stepIndex(0, 1, 5)).toBe(1);
    expect(stepIndex(4, 1, 5)).toBe(0);
    expect(stepIndex(0, -1, 5)).toBe(4);
    expect(stepIndex(2, -1, 5)).toBe(1);
  });

  it('handles a single photo and an empty list', () => {
    expect(stepIndex(0, 1, 1)).toBe(0);
    expect(stepIndex(0, -1, 1)).toBe(0);
    expect(stepIndex(0, 1, 0)).toBe(0);
  });
});

describe('swipeDirection', () => {
  it('reads clear sideways swipes', () => {
    expect(swipeDirection(-120, 10)).toBe('next');
    expect(swipeDirection(120, -10)).toBe('previous');
  });

  it('ignores taps, small moves and mostly-vertical moves', () => {
    expect(swipeDirection(0, 0)).toBeNull();
    expect(swipeDirection(-30, 0)).toBeNull();
    expect(swipeDirection(-80, 90)).toBeNull();
  });
});
