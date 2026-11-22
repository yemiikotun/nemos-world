import { Link } from 'react-router-dom';
import { findByDate, formatMinutes, moodInfo } from '../lib/diary';
import { toIsoDate } from '../lib/dates';
import { useDiary } from '../lib/useDiary';
import { NEMO } from '../lib/nemo';

/** Home page card: today's diary entry, or a prompt to write one. */
export default function TodayDiaryCard({ today }: { today: Date }) {
  const { items } = useDiary();
  const entry = findByDate(items, toIsoDate(today));

  return (
    <section className="card" aria-labelledby="today-diary-title">
      <h2 id="today-diary-title" className="stat-label">Today's diary</h2>
      {entry?.boarding ? (
        <>
          <p className="today-diary-prompt"><span aria-hidden="true">🧳</span> {NEMO.name} is in boarding today.</p>
          <Link to="/diary?write=today" className="text-link up-next-all">Edit today's entry →</Link>
        </>
      ) : entry ? (
        <>
          <p className="today-diary-meta">
            {entry.atDaycare && <><span aria-hidden="true">🏫</span> Daycare · </>}
            {entry.mood && <>{moodInfo(entry.mood).emoji} {moodInfo(entry.mood).label} · </>}
            {entry.walkMinutes > 0 ? `🐾 ${formatMinutes(entry.walkMinutes)} walk` : 'No walk yet'}
          </p>
          {entry.text && <p className="today-diary-text">{entry.text}</p>}
          <Link to="/diary?write=today" className="text-link up-next-all">Edit today's entry →</Link>
        </>
      ) : (
        <>
          <p className="today-diary-prompt">How was {NEMO.name}'s day?</p>
          <Link to="/diary?write=today" className="button button-link">Write today's entry</Link>
        </>
      )}
    </section>
  );
}
