import { useState } from 'react';
import { format } from 'date-fns';
import { formatMinutes, type DayWalk } from '../../lib/diary';
import { parseLocalDate, toIsoDate } from '../../lib/dates';

/** What a day's tooltip or table cell says about the walk. */
function walkText(day: DayWalk): string {
  if (day.boarding) return 'Boarding';
  if (!day.hasEntry) return 'No entry';
  return day.minutes > 0 ? `${formatMinutes(day.minutes)} walk` : 'No walk';
}

/**
 * Column chart of the last 7 days.
 * - Orange bars: walk minutes (height = minutes, scaled to the longest walk).
 * - Gray bars: daycare days. They run the full height, since they mark the day
 *   rather than measure anything.
 * The legend appears when there's a daycare day to explain.
 */
export default function WalkChart({ days, today }: { days: DayWalk[]; today: Date }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...days.map((d) => d.minutes), 0);
  const peakIndex = max > 0 ? days.findIndex((d) => d.minutes === max) : -1;
  const todayIso = toIsoDate(today);
  const anyDaycare = days.some((d) => d.atDaycare);

  return (
    <figure className="walk-chart">
      <div className="walk-chart-plot" aria-hidden="true" onPointerLeave={() => setActive(null)}>
        {days.map((day, i) => {
          const date = parseLocalDate(day.date);
          const height = max > 0 ? (day.minutes / max) * 100 : 0;
          const both = day.atDaycare && day.minutes > 0;
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
                    {day.atDaycare && <span>Daycare</span>}
                    <span>{walkText(day)}</span>
                  </span>
                )}
                <span className={`walk-bars${both ? ' walk-bars-pair' : ''}`}>
                  {day.atDaycare && <span className="walk-bar walk-bar-daycare" style={{ height: '100%' }} />}
                  {day.minutes > 0 && <span className="walk-bar" style={{ height: `${height}%` }} />}
                </span>
              </div>
              <span className={`walk-day${day.date === todayIso ? ' walk-day-today' : ''}`}>
                {day.date === todayIso ? 'Today' : format(date, 'EEE')}
              </span>
            </div>
          );
        })}
      </div>

      {anyDaycare && (
        <div className="walk-legend" aria-hidden="true">
          <span><span className="walk-swatch" /> Walk minutes</span>
          <span><span className="walk-swatch walk-swatch-daycare" /> Daycare day</span>
        </div>
      )}

      <figcaption className="visually-hidden">Walk minutes and daycare days for each of the last 7 days</figcaption>
      <table className="visually-hidden">
        <thead><tr><th>Day</th><th>Walk</th><th>Daycare</th></tr></thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.date}>
              <td>{format(parseLocalDate(day.date), 'EEEE, MMMM d')}</td>
              <td>{walkText(day)}</td>
              <td>{day.atDaycare ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
