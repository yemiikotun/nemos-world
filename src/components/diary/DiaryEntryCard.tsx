import { formatMinutes, moodInfo, type DiaryEntry } from '../../lib/diary';
import { parseLocalDate } from '../../lib/dates';
import { format } from 'date-fns';

export default function DiaryEntryCard({ entry, today, onEdit }: { entry: DiaryEntry; today: Date; onEdit: (e: DiaryEntry) => void }) {
  const date = parseLocalDate(entry.date);
  const mood = entry.mood ? moodInfo(entry.mood) : null;
  return (
    <li>
      <button type="button" className="diary-entry" onClick={() => onEdit(entry)} aria-label={`Edit entry for ${format(date, 'EEEE, MMMM d, yyyy')}`}>
        <span className="diary-entry-head">
          <span className="diary-entry-date">
            {format(date, date.getFullYear() === today.getFullYear() ? 'EEEE, MMM d' : 'EEEE, MMM d, yyyy')}
          </span>
          {mood && <span className="mood-tag"><span aria-hidden="true">{mood.emoji}</span> {mood.label}</span>}
        </span>
        <span className="diary-entry-walk">
          {entry.walkMinutes > 0 ? `🐾 ${formatMinutes(entry.walkMinutes)} walk` : 'No walk'}
        </span>
        <span className="diary-entry-text">{entry.text}</span>
      </button>
    </li>
  );
}
