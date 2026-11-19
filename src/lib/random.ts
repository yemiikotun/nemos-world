/** Small, dependency-free helpers for repeatable "random" choices. */

/** A seeded pseudo-random number generator (mulberry32). Same seed → same sequence. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The numbers 0…count-1 in a shuffled order that is always the same for the same seed. */
export function seededPermutation(count: number, seed: number): number[] {
  const order = Array.from({ length: count }, (_, i) => i);
  const random = seededRandom(seed);
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/** A random index from 0…count-1 that is different from `current` (if there's more than one). */
export function pickDifferentIndex(count: number, current: number, random: () => number = Math.random): number {
  if (count < 2) return current;
  const pick = Math.floor(random() * (count - 1));
  return pick >= current ? pick + 1 : pick;
}
