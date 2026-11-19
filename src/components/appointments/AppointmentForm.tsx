import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CATEGORIES, REPEAT_LABELS, canRepeat, type Appointment, type AppointmentInput, type Category } from '../../lib/appointments';
import type { Repeat } from '../../lib/dates';

interface Props {
  /** The item being edited, or null when adding a new one. */
  editing: Appointment | null;
  open: boolean;
  defaultDate: string;
  onSave: (input: AppointmentInput) => void;
  onDelete: (item: Appointment) => void;
  onClose: () => void;
}

const empty = (date: string): AppointmentInput => ({ title: '', category: 'vet', date, time: '', notes: '', repeat: 'none' });

/** Add / edit form, shown in a native <dialog> (keyboard and screen-reader friendly). */
export default function AppointmentForm({ editing, open, defaultDate, onSave, onDelete, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState<AppointmentInput>(empty(defaultDate));

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      setForm(editing ? { ...editing, time: editing.time ?? '', notes: editing.notes ?? '' } : empty(defaultDate));
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open, editing, defaultDate]);

  const set = <K extends keyof AppointmentInput>(key: K, value: AppointmentInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    onSave(form);
  };

  return (
    <dialog ref={dialogRef} className="dialog" onClose={onClose} aria-labelledby="appt-form-title">
      <form onSubmit={submit} className="form">
        <h2 id="appt-form-title">{editing ? 'Edit appointment' : 'New appointment'}</h2>

        <label className="field">
          <span>What is it?</span>
          <input
            type="text"
            required
            maxLength={120}
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Annual checkup, Heartworm pill"
          />
        </label>

        <label className="field">
          <span>Category</span>
          <select value={form.category} onChange={(e) => set('category', e.target.value as Category)}>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
            ))}
          </select>
        </label>

        <div className="field-row">
          <label className="field">
            <span>Date</span>
            <input type="date" required value={form.date} onChange={(e) => set('date', e.target.value)} />
          </label>
          <label className="field">
            <span>Time <em>(optional)</em></span>
            <input type="time" value={form.time ?? ''} onChange={(e) => set('time', e.target.value)} />
          </label>
        </div>

        {canRepeat(form.category) && (
          <label className="field">
            <span>Repeats</span>
            <select value={form.repeat} onChange={(e) => set('repeat', e.target.value as Repeat)}>
              {(Object.keys(REPEAT_LABELS) as Repeat[]).map((r) => (
                <option key={r} value={r}>{REPEAT_LABELS[r]}</option>
              ))}
            </select>
          </label>
        )}

        <label className="field">
          <span>Notes <em>(optional)</em></span>
          <textarea
            rows={3}
            maxLength={1000}
            value={form.notes ?? ''}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Dose, clinic address, what to bring…"
          />
        </label>

        <div className="form-actions">
          {editing && (
            <button type="button" className="button button-danger" onClick={() => onDelete(editing)}>
              Delete
            </button>
          )}
          <span className="spacer" />
          <button type="button" className="button button-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="button">{editing ? 'Save' : 'Add'}</button>
        </div>
      </form>
    </dialog>
  );
}
