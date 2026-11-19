import WalkChart from './WalkChart';
import { minuteParts, walkStats, walksForLastDays, type DiaryEntry } from '../../lib/diary';

export default function WalkStatsCard({ entries, today }: { entries: DiaryEntry[]; today: Date }) {
  const days = walksForLastDays(entries, today, 7);
  const stats = walkStats(days);
  return (
    <section className="card walk-stats" aria-labelledby="walk-stats-title">
      <h2 id="walk-stats-title" className="stat-label">Walks · last 7 days</h2>
      <dl className="stat-tiles">
        <div>
          <dt>Total</dt>
          <dd><Minutes value={stats.totalMinutes} /></dd>
        </div>
        <div>
          <dt>Average walk</dt>
          <dd>{stats.averageMinutes === null ? '—' : <Minutes value={stats.averageMinutes} />}</dd>
        </div>
        <div>
          <dt>Days walked</dt>
          <dd>{stats.daysWalked} <span className="hint">of 7</span></dd>
        </div>
      </dl>
      {stats.daysWalked === 0 && <p className="muted-note walk-empty">No walks logged in the last 7 days yet.</p>}
      <WalkChart days={days} today={today} />
    </section>
  );
}

/** "2 hr 42 min" with the numbers large and the units small, so it fits a narrow tile. */
function Minutes({ value }: { value: number }) {
  return (
    <>
      {minuteParts(value).map(([number, unit], i) => (
        <span key={unit}>
          {i > 0 && ' '}
          {number}
          <span className="unit">{unit}</span>
        </span>
      ))}
    </>
  );
}
