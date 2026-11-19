import { useEffect, useRef, useState, type FormEvent } from 'react';
import { MAX_WALK_MINUTES, MOODS, findByDate, isDateTaken, type DiaryEntry, type DiaryInput, type Mood } from '../../lib/diary';
import { formatShortDate } from '../../lib/formatting';

interface Props {
  open: boolean;
  /** The entry being edited, or null for a new one. */
  editing: DiaryEntry | null;
  entries: DiaryEntry[];
  today: Date;
  defaultDate: string;
  onSave: (input: DiaryInput) => void;
  onDelete: (entry: DiaryEntry) => void;
  /** Switch to editing an existing entry (used when the chosen date already has one). */
  onOpenExisting: (entry: DiaryEntry) => void;
  onClose: () => void;
}

interface FormState {
  date: string;
  text: string;
  walkMinutes: string;
  mood?: Mood;
}

const fromEntry = (entry: DiaryEntry | null, date: string): FormState =>
  entry
    ? { date: entry.date, text: entry.text, walkMinutes: entry.walkMinutes ? String(entry.walkMinutes) : '', mood: entry.mood }
    : { date, text: '', walkMinutes: '', mood: undefined };

export default function DiaryForm({ open, editing, entries, today, defaultDate, onSave, onDelete, onOpenExisting, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState<FormState>(fromEntry(null, defaultDate));

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      setForm(fromEntry(editing, defaultDate));
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open, editing, defaultDate]);

  const existing = isDateTaken(entries, form.date, editing?.id) ? findByDate(entries, form.date) : undefined;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (existing || !form.text.trim()) return;
    onSave({ date: form.date, text: form.text, walkMinutes: Number(form.walkMinutes || 0), mood: form.mood });
  };

  return (
    <dialog ref={dialogRef} className="dialog" onClose={onClose} aria-labelledby="diary-form-title">
      <form onSubmit={submit} className="form">
        <h2 id="diary-form-title">{editing ? 'Edit diary entry' : 'New diary entry'}</h2>

        <label className="field">
          <span>Date</span>
          <input
            type="date"
            required
            value={form.date}
            max={defaultDate}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
        </label>
        {existing && (
          <p className="form-warning" role="alert">
            There's already an entry for {formatShortDate(existing.date, today)}.{' '}
            <button type="button" className="link-button" onClick={() => onOpenExisting(existing)}>
              Open it instead
            </button>
          </p>
        )}

        <label className="field">
          <span>What did Nemo do today?</span>
          <textarea
            rows={5}
            required
            maxLength={4000}
            value={form.text}
            onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
            placeholder="Played fetch in the park, met a new friend, napped all afternoon…"
          />
        </label>

        <label className="field">
          <span>Walk length <em>(minutes)</em></span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={MAX_WALK_MINUTES}
            step={1}
            value={form.walkMinutes}
            onChange={(e) => setForm((f) => ({ ...f, walkMinutes: e.target.value }))}
            placeholder="0"
          />
        </label>

        <fieldset className="field mood-field">
          <legend>Mood <em>(optional)</em></legend>
          <div className="chips">
            {MOODS.map((mood) => (
              <button
                key={mood.id}
                type="button"
                className={`chip${form.mood === mood.id ? ' chip-active' : ''}`}
                aria-pressed={form.mood === mood.id}
                onClick={() => setForm((f) => ({ ...f, mood: f.mood === mood.id ? undefined : mood.id }))}
              >
                <span aria-hidden="true">{mood.emoji} </span>{mood.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="form-actions">
          {editing && (
            <button type="button" className="button button-danger" onClick={() => onDelete(editing)}>Delete</button>
          )}
          <span className="spacer" />
          <button type="button" className="button button-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="button" disabled={Boolean(existing)}>{editing ? 'Save' : 'Add'}</button>
        </div>
      </form>
    </dialog>
  );
}
