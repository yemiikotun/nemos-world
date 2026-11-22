import { useState } from 'react';
import PhotoViewer from './PhotoViewer';
import { PHOTOS } from '../lib/photos';
import { NEMO } from '../lib/nemo';

/** Every photo in the rotation as thumbnails. Tap one to open it full screen. */
export default function PhotoGrid() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (PHOTOS.length === 0) return null;

  return (
    <section aria-labelledby="all-photos-title" className="photo-grid-section">
      <h2 id="all-photos-title" className="section-title">
        All photos <span className="hint">({PHOTOS.length} · tap one to open it)</span>
      </h2>
      <ul className="photo-grid">
        {PHOTOS.map((photo, i) => (
          <li key={photo.name}>
            <button
              type="button"
              className="photo-thumb"
              onClick={() => setOpenIndex(i)}
              aria-label={`Open photo ${i + 1} of ${PHOTOS.length}: ${photo.caption ?? `a photo of ${NEMO.name}`}`}
            >
              <img
                src={photo.src}
                srcSet={photo.srcSet}
                sizes="(min-width: 768px) 200px, 33vw"
                width={photo.width}
                height={photo.height}
                loading="lazy"
                decoding="async"
                alt=""
                // Offline and not saved yet: show a soft blank tile instead of a broken image.
                onError={(event) => event.currentTarget.classList.add('photo-missing')}
              />
            </button>
          </li>
        ))}
      </ul>
      <PhotoViewer photos={PHOTOS} index={openIndex} onChange={setOpenIndex} onClose={() => setOpenIndex(null)} />
    </section>
  );
}
