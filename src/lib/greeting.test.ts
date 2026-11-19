import { describe, expect, it } from 'vitest';
import { greetingFor } from './greeting';

describe('greetingFor', () => {
  it('changes with the time of day', () => {
    expect([0, 4, 5, 11, 12, 16, 17, 23].map(greetingFor)).toEqual([
      'Good evening', 'Good evening', 'Good morning', 'Good morning',
      'Good afternoon', 'Good afternoon', 'Good evening', 'Good evening',
    ]);
  });
});
