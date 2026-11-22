import { useState } from 'react';
import { format } from 'date-fns';
import { formatMinutes, type DayWalk } from '../../lib/diary';
import { parseLocalDate, toIsoDate } from '../../lib/dates';

/** Column chart of walk minutes for the last 7 days. One series, so no legend. */
export default function WalkChart({ days, today }: { days: DayWalk[]; today: Date }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...days.map((d) => d.minutes), 0);
  const peakIndex = max > 0 ? days.findIndex((d) => d.minutes === max) : -1;
  const todayIso = toIsoDate(today);

  return (
    <figure className="walk-chart">
      <div className="walk-chart-plot" aria-hidden="true" onPointerLeave={() => setActive(null)}>
        {days.map((day, i) => {
          const date = parseLocalDate(day.date);
          const height = max > 0 ? (day.minutes / max) * 100 : 0;
          return (
            <div
              key={day.date}
              className={`walk-col${active === i ? ' walk-col-active' : ''}`}
              onPointerEnter={() => setActive(i)}
              onClick={() => setActive(active === i ? null : i)}
            >
              <div className="walk-bar-area">
                {i === peakIndex && active !== i && <span className="walk-peak-label">{formatMinutes(day.minutes)}</span>}
                {active === i && (
                  <span className="walk-tooltip">
                    <strong>{format(date, 'EEE, MMM d')}</strong>
                    {day.boarding ? 'Boarding' : day.hasEntry ? (day.minutes > 0 ? formatMinutes(day.minutes) : 'No walk') : 'No entry'}
                  </span>
                )}
                {day.minutes > 0 && <span className="walk-bar" style={{ height: `${height}%` }} />}
              </div>
              <span className={`walk-day${day.date === todayIso ? ' walk-day-today' : ''}`}>
                {day.date === todayIso ? 'Today' : format(date, 'EEE')}
              </span>
            </div>
          );
        })}
      </div>
      <figcaption className="visually-hidden">Walk minutes for each of the last 7 days</figcaption>
      <table className="visually-hidden">
        <thead><tr><th>Day</th><th>Walk</th></tr></thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.date}>
              <td>{format(parseLocalDate(day.date), 'EEEE, MMMM d')}</td>
              <td>{day.boarding ? 'Boarding' : day.hasEntry ? formatMinutes(day.minutes) : 'No entry'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
