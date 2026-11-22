import PageHeading from '../components/PageHeading';
import { DAYCARE_LOCATIONS, DAYCARE_NAME } from '../lib/daycare';
import { NEMO } from '../lib/nemo';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useOnlineStatus } from '../lib/useOnlineStatus';

const cameraIcon = (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="6" width="14" height="12" rx="2" />
    <path d="M16 10l6-3v10l-6-3z" />
  </svg>
);

/** Links to the daycare webcams, so Nemo can be checked on during the day. */
export default function DaycarePage() {
  useDocumentTitle('Nemo at Daycare');
  const online = useOnlineStatus();

  return (
    <>
      <PageHeading title={`${NEMO.name} at Daycare`} subtitle={`Check in on ${NEMO.name} through the ${DAYCARE_NAME} webcams.`} />
      <div className="grid">
        {DAYCARE_LOCATIONS.map((location) => (
          <section key={location.id} className="card daycare-card" aria-labelledby={`daycare-${location.id}`}>
            <div className="daycare-head">
              <span className="icon-bubble daycare-icon">{cameraIcon}</span>
              <div>
                <h2 id={`daycare-${location.id}`}>{location.title}</h2>
                <p>{DAYCARE_NAME} · {location.area}</p>
              </div>
            </div>
            {online ? (
              <a
                className="button daycare-button"
                href={location.webcamUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Watch the {location.place} webcam <span aria-hidden="true">↗</span>
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            ) : (
              <p className="form-warning daycare-offline">The webcam needs an internet connection.</p>
            )}
          </section>
        ))}
      </div>
      <p className="muted-note daycare-note">
        The webcams open on {DAYCARE_NAME}'s website in a new tab. You may need to sign in there.
      </p>
    </>
  );
}
