import { categoryInfo, relativeDayLabel, REPEAT_LABELS, type Appointment } from '../../lib/appointments';
import { formatShortDate, formatTime } from '../../lib/formatting';

interface Props {
  item: Appointment;
  today: Date;
  overdue?: boolean;
  onToggleDone: (item: Appointment) => void;
  onEdit: (item: Appointment) => void;
}

export default function AppointmentItem({ item, today, overdue = false, onToggleDone, onEdit }: Props) {
  const category = categoryInfo(item.category);
  const when = [
    formatShortDate(item.date, today),
    item.time && formatTime(item.time),
    !item.done && relativeDayLabel(item.date, today),
  ].filter(Boolean);

  return (
    <li className={`appt${overdue ? ' appt-overdue' : ''}${item.done ? ' appt-done' : ''}`}>
      <input
        type="checkbox"
        className="appt-check"
        checked={item.done}
        onChange={() => onToggleDone(item)}
        aria-label={item.done ? `Mark "${item.title}" as not done` : `Mark "${item.title}" as done`}
      />
      <div className="appt-body">
        <p className="appt-title">
          <span aria-hidden="true">{category.emoji}</span> {item.title}
        </p>
        <p className="appt-meta">
          <span className="visually-hidden">{category.label}. </span>
          {when.join(' · ')}
          {item.repeat !== 'none' && <span className="appt-repeat">↻ {REPEAT_LABELS[item.repeat]}</span>}
        </p>
        {item.notes && <p className="appt-notes">{item.notes}</p>}
      </div>
      <button type="button" className="icon-button" onClick={() => onEdit(item)} aria-label={`Edit "${item.title}"`}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M14 6l4 4" />
        </svg>
      </button>
    </li>
  );
}
