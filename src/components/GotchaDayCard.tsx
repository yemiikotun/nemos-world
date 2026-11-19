import { format } from 'date-fns';
import CelebrationBanner from './CelebrationBanner';
import {
  breakdownBetween,
  daysBetween,
  formatBreakdown,
  isAnniversary,
  nextAnniversary,
  nextAnniversaryNumber,
  ordinal,
  parseLocalDate,
} from '../lib/dates';
import { NEMO } from '../lib/nemo';

export default function GotchaDayCard({ today }: { today: Date }) {
  const gotchaDay = parseLocalDate(NEMO.gotchaDay);
  const daysHome = daysBetween(gotchaDay, today);
  const celebrating = isAnniversary(gotchaDay, today);
  const next = nextAnniversary(gotchaDay, today);
  const nextNumber = nextAnniversaryNumber(gotchaDay, today);
  const daysUntilNext = daysBetween(today, next);

  if (daysHome < 0) {
    return (
      <section className="card stat-card" aria-labelledby="gotcha-title">
        <h2 id="gotcha-title" className="stat-label">Gotcha Day</h2>
        <p className="stat-number">{-daysHome}<span> {-daysHome === 1 ? 'day' : 'days'}</span></p>
        <p className="stat-detail">until {NEMO.name} comes home on {format(gotchaDay, 'MMMM d, yyyy')}</p>
      </section>
    );
  }

  return (
    <section className="card stat-card" aria-labelledby="gotcha-title">
      <h2 id="gotcha-title" className="stat-label">Gotcha Day</h2>
      {celebrating && (
        <CelebrationBanner emoji="🎉">
          {`Happy ${ordinal(nextNumber)} Gotcha Day, ${NEMO.name}!`}
        </CelebrationBanner>
      )}
      <p className="stat-number">
        {daysHome.toLocaleString()}<span> {daysHome === 1 ? 'day' : 'days'}</span>
      </p>
      <p className="stat-detail">since {NEMO.name} came home</p>
      <dl className="stat-facts">
        <div>
          <dt>That's</dt>
          <dd>{formatBreakdown(breakdownBetween(gotchaDay, today))}</dd>
        </div>
        <div>
          <dt>Came home</dt>
          <dd>{format(gotchaDay, 'MMMM d, yyyy')}</dd>
        </div>
        {!celebrating && (
          <div>
            <dt>Next Gotcha Day</dt>
            <dd>
              {ordinal(nextNumber)} in {daysUntilNext.toLocaleString()} {daysUntilNext === 1 ? 'day' : 'days'}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
