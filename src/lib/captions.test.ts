import { describe, expect, it } from 'vitest';
import { captionFromFileName } from './captions';

describe('captionFromFileName', () => {
  it('turns descriptive file names into captions', () => {
    expect(captionFromFileName('nemo-at-the-beach.jpg')).toBe('Nemo at the beach');
    expect(captionFromFileName('first_bath.PNG')).toBe('First bath');
    expect(captionFromFileName('sleepy nemo 2.jpg')).toBe('Sleepy nemo 2');
  });

  it('skips camera-style names', () => {
    expect(captionFromFileName('IMG_1234.JPG')).toBeNull();
    expect(captionFromFileName('PXL_20260704_123456.jpg')).toBeNull();
    expect(captionFromFileName('20260704_123456.jpg')).toBeNull();
    expect(captionFromFileName('DSC-0042.jpeg')).toBeNull();
  });
});
