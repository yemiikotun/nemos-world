import { Link } from 'react-router-dom';
import { categoryInfo, relativeDayLabel, upNext } from '../lib/appointments';
import { toIsoDate } from '../lib/dates';
import { formatTime } from '../lib/formatting';
import { useAppointments } from '../lib/useAppointments';

/** The next 3 appointments or doses, for the Home page. */
export default function UpNextCard({ today }: { today: Date }) {
  const { items } = useAppointments();
  const next = upNext(items, 3);
  const todayIso = toIsoDate(today);

  return (
    <section className="card" aria-labelledby="up-next-title">
      <h2 id="up-next-title" className="stat-label">Up next</h2>
      {next.length === 0 ? (
        <p className="up-next-empty">
          Nothing scheduled. <Link to="/appointments" className="text-link">Add an appointment</Link>
        </p>
      ) : (
        <ul className="up-next">
          {next.map((item) => (
            <li key={item.id} className={item.date < todayIso ? 'up-next-overdue' : undefined}>
              <span className="up-next-emoji" aria-hidden="true">{categoryInfo(item.category).emoji}</span>
              <span className="up-next-title">{item.title}</span>
              <span className="up-next-when">
                {item.date < todayIso ? 'Overdue' : relativeDayLabel(item.date, today)}
                {item.time && ` · ${formatTime(item.time)}`}
              </span>
            </li>
          ))}
        </ul>
      )}
      <Link to="/appointments" className="text-link up-next-all">See all appointments →</Link>
    </section>
  );
}
