import { useState } from 'react';
import { format } from 'date-fns';
import PawIcon from './PawIcon';
import { PHOTOS } from '../lib/photos';
import { photoOfTheDayIndex } from '../lib/dates';
import { pickDifferentIndex } from '../lib/random';
import { NEMO } from '../lib/nemo';

interface Props {
  today: Date;
  /** "card" for the Home page, "hero" for the larger Photos page version. */
  variant?: 'card' | 'hero';
}

export default function PictureOfTheDay({ today, variant = 'card' }: Props) {
  const dailyIndex = photoOfTheDayIndex(PHOTOS.length, today);
  const [shuffledIndex, setShuffledIndex] = useState<number | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const index = shuffledIndex ?? dailyIndex;
  const photo = PHOTOS[index];
  const isShuffled = shuffledIndex !== null && shuffledIndex !== dailyIndex;

  return (
    <section className={`card photo-card photo-card-${variant}`} aria-labelledby={`potd-title-${variant}`}>
      <div className="photo-card-header">
        <div>
          <h2 id={`potd-title-${variant}`} className="stat-label">
            {isShuffled ? 'Shuffled photo' : 'Picture of the Day'}
          </h2>
          <p className="photo-card-date">{format(today, 'EEEE, MMMM d')}</p>
        </div>
        {PHOTOS.length > 1 && (
          <div className="photo-actions">
            {isShuffled && (
              <button type="button" className="button button-ghost" onClick={() => setShuffledIndex(null)}>
                Today's photo
              </button>
            )}
            <button
              type="button"
              className="button"
              onClick={() => setShuffledIndex(pickDifferentIndex(PHOTOS.length, index))}
            >
              Shuffle
            </button>
          </div>
        )}
      </div>

      {photo ? (
        <figure className={`photo-frame${loadedSrc === photo.src ? '' : ' photo-loading'}`}>
          <img
            key={photo.name}
            src={photo.src}
            srcSet={photo.srcSet}
            sizes={variant === 'hero' ? '(min-width: 960px) 900px, 100vw' : '(min-width: 768px) 460px, 100vw'}
            width={photo.width}
            height={photo.height}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoadedSrc(photo.src)}
            onError={() => setLoadedSrc(photo.src)}
            alt={photo.caption ?? `A photo of ${NEMO.name}`}
          />
          {photo.caption && <figcaption>{photo.caption}</figcaption>}
        </figure>
      ) : (
        <div className="photo-empty">
          <span className="icon-bubble"><PawIcon size={20} /></span>
          <p>
            No photos yet. Add JPG, PNG or WebP photos of {NEMO.name} to the <code>src/assets/nemo/</code> folder
            and a new one will show up here every day.
          </p>
        </div>
      )}
    </section>
  );
}
