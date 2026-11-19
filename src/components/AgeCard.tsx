import { format } from 'date-fns';
import CelebrationBanner from './CelebrationBanner';
import {
  approxDogYears,
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

export default function AgeCard({ today }: { today: Date }) {
  const birthday = parseLocalDate(NEMO.birthday);
  const age = breakdownBetween(birthday, today);
  const daysAlive = daysBetween(birthday, today);
  const celebrating = isAnniversary(birthday, today);
  const nextNumber = nextAnniversaryNumber(birthday, today);
  const daysUntilBirthday = daysBetween(today, nextAnniversary(birthday, today));

  return (
    <section className="card stat-card" aria-labelledby="age-title">
      <h2 id="age-title" className="stat-label">Age</h2>
      {celebrating && (
        <CelebrationBanner emoji="🎂">{`Happy ${ordinal(nextNumber)} birthday, ${NEMO.name}!`}</CelebrationBanner>
      )}
      <p className="stat-number stat-number-text">{formatBreakdown(age)}</p>
      <p className="stat-detail">old</p>
      <dl className="stat-facts">
        <div>
          <dt>Days alive</dt>
          <dd>{daysAlive.toLocaleString()}</dd>
        </div>
        <div>
          <dt>Born</dt>
          <dd>{format(birthday, 'MMMM d, yyyy')}</dd>
        </div>
        {!celebrating && (
          <div>
            <dt>Next birthday</dt>
            <dd>
              Turns {nextNumber} in {daysUntilBirthday.toLocaleString()} {daysUntilBirthday === 1 ? 'day' : 'days'}
            </dd>
          </div>
        )}
        <div>
          <dt>In dog years</dt>
          <dd>About {approxDogYears(birthday, today)} <span className="hint">(approximate)</span></dd>
        </div>
      </dl>
    </section>
  );
}
