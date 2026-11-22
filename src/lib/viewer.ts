/** Rules for the full-screen photo viewer, kept apart from the UI so they're easy to test. */

/** Move `step` places through `count` photos, wrapping around at either end. */
export function stepIndex(index: number, step: number, count: number): number {
  if (count <= 0) return 0;
  return (((index + step) % count) + count) % count;
}

/**
 * Which way a finger swipe goes: a mostly-sideways move of at least `threshold`
 * pixels. Swiping left (finger moves left) shows the next photo.
 */
export function swipeDirection(dx: number, dy: number, threshold = 50): 'next' | 'previous' | null {
  if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy) * 1.5) return null;
  return dx < 0 ? 'next' : 'previous';
}
