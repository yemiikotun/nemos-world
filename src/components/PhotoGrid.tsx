import { PHOTOS } from '../lib/photos';
import { NEMO } from '../lib/nemo';

/** Every photo in the rotation, as small thumbnails. */
export default function PhotoGrid() {
  if (PHOTOS.length === 0) return null;
  return (
    <section aria-labelledby="all-photos-title" className="photo-grid-section">
      <h2 id="all-photos-title" className="section-title">
        All photos <span className="hint">({PHOTOS.length} in the rotation)</span>
      </h2>
      <ul className="photo-grid">
        {PHOTOS.map((photo) => (
          <li key={photo.name}>
            <img
              src={photo.src}
              srcSet={photo.srcSet}
              sizes="(min-width: 768px) 200px, 33vw"
              width={photo.width}
              height={photo.height}
              loading="lazy"
              decoding="async"
              alt={photo.caption ?? `A photo of ${NEMO.name}`}
              // Offline and not saved yet: show a soft blank tile instead of a broken image.
              onError={(event) => event.currentTarget.classList.add('photo-missing')}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
