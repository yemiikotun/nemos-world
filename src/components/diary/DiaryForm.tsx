import { useEffect, useRef, useState, type FormEvent } from 'react';
import { MAX_WALK_MINUTES, MOODS, findByDate, isDateTaken, needsNarrative, type DiaryEntry, type DiaryInput, type Mood } from '../../lib/diary';
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
  atDaycare: boolean;
  boarding: boolean;
}

const fromEntry = (entry: DiaryEntry | null, date: string): FormState =>
  entry
    ? {
        date: entry.date,
        text: entry.text,
        walkMinutes: entry.walkMinutes ? String(entry.walkMinutes) : '',
        mood: entry.mood,
        atDaycare: Boolean(entry.atDaycare),
        boarding: Boolean(entry.boarding),
      }
    : { date, text: '', walkMinutes: '', mood: undefined, atDaycare: false, boarding: false };

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
  const textRequired = needsNarrative(form);
  // While boarding, the day's details can't be known, so those fields are grayed out.
  // (What was typed stays in the form, in case the box is unticked again.)
  const detailsDisabled = form.boarding;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (existing || (textRequired && !form.text.trim())) return;
    onSave({
      date: form.date,
      text: form.text,
      walkMinutes: Number(form.walkMinutes || 0),
      mood: form.mood,
      atDaycare: form.atDaycare,
      boarding: form.boarding,
    });
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

        <fieldset className="day-type">
          <legend className="visually-hidden">Where Nemo was</legend>
          <label className="check">
            <input
              type="checkbox"
              checked={form.atDaycare}
              disabled={form.boarding}
              onChange={(e) => setForm((f) => ({ ...f, atDaycare: e.target.checked }))}
            />
            <span>Nemo is in Daycare Today</span>
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={form.boarding}
              onChange={(e) => setForm((f) => ({ ...f, boarding: e.target.checked, atDaycare: e.target.checked ? false : f.atDaycare }))}
            />
            <span>Nemo is in Boarding</span>
          </label>
          {form.boarding && (
            <p className="check-note">No diary needed for boarding days. This day will be saved as "Boarding".</p>
          )}
        </fieldset>

        <label className={`field${detailsDisabled ? ' field-disabled' : ''}`}>
          <span>
            {form.atDaycare ? 'How did Nemo do at daycare?' : 'What did Nemo do today?'}
            {!textRequired && !detailsDisabled && <em> (optional)</em>}
          </span>
          <textarea
            rows={5}
            required={textRequired}
            disabled={detailsDisabled}
            maxLength={4000}
            value={form.text}
            onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
            placeholder={
              detailsDisabled
                ? "Not needed: Nemo is boarding."
                : form.atDaycare
                  ? 'Made friends, played in the yard, came home tired…'
                  : 'Played fetch in the park, met a new friend, napped all afternoon…'
            }
          />
        </label>

        <label className={`field${detailsDisabled ? ' field-disabled' : ''}`}>
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
            disabled={detailsDisabled}
          />
        </label>

        <fieldset className={`field mood-field${detailsDisabled ? ' field-disabled' : ''}`} disabled={detailsDisabled}>
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
