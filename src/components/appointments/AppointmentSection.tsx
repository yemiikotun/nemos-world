import AppointmentItem from './AppointmentItem';
import type { Appointment } from '../../lib/appointments';

interface Props {
  title: string;
  items: Appointment[];
  today: Date;
  tone?: 'default' | 'overdue';
  onToggleDone: (item: Appointment) => void;
  onEdit: (item: Appointment) => void;
}

export default function AppointmentSection({ title, items, today, tone = 'default', onToggleDone, onEdit }: Props) {
  if (items.length === 0) return null;
  return (
    <section className="appt-section" aria-label={title}>
      <h2 className={`section-title${tone === 'overdue' ? ' section-title-overdue' : ''}`}>
        {title} <span className="count">{items.length}</span>
      </h2>
      <ul className="appt-list">
        {items.map((item) => (
          <AppointmentItem
            key={item.id}
            item={item}
            today={today}
            overdue={tone === 'overdue'}
            onToggleDone={onToggleDone}
            onEdit={onEdit}
          />
        ))}
      </ul>
    </section>
  );
}
