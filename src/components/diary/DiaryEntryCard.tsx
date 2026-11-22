import { formatMinutes, moodInfo, type DiaryEntry } from '../../lib/diary';
import { parseLocalDate } from '../../lib/dates';
import { NEMO } from '../../lib/nemo';
import { format } from 'date-fns';

export default function DiaryEntryCard({ entry, today, onEdit }: { entry: DiaryEntry; today: Date; onEdit: (e: DiaryEntry) => void }) {
  const date = parseLocalDate(entry.date);
  const mood = entry.mood ? moodInfo(entry.mood) : null;
  return (
    <li>
      <button
        type="button"
        className={`diary-entry${entry.boarding ? ' diary-entry-boarding' : ''}`}
        onClick={() => onEdit(entry)}
        aria-label={`Edit entry for ${format(date, 'EEEE, MMMM d, yyyy')}`}
      >
        <span className="diary-entry-head">
          <span className="diary-entry-date">
            {format(date, date.getFullYear() === today.getFullYear() ? 'EEEE, MMM d' : 'EEEE, MMM d, yyyy')}
          </span>
          <span className="diary-tags">
            {entry.atDaycare && <span className="day-tag"><span aria-hidden="true">🏫</span> Daycare</span>}
            {entry.boarding && <span className="day-tag"><span aria-hidden="true">🧳</span> Boarding</span>}
            {mood && <span className="mood-tag"><span aria-hidden="true">{mood.emoji}</span> {mood.label}</span>}
          </span>
        </span>
        {entry.boarding ? (
          <span className="diary-entry-text diary-entry-muted">{NEMO.name} was boarding, so there's no diary for this day.</span>
        ) : (
          <>
            <span className="diary-entry-walk">
              {entry.walkMinutes > 0 ? `🐾 ${formatMinutes(entry.walkMinutes)} walk` : 'No walk'}
            </span>
            {entry.text && <span className="diary-entry-text">{entry.text}</span>}
          </>
        )}
      </button>
    </li>
  );
}
