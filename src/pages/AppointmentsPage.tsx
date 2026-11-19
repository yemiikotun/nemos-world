import { useState } from 'react';
import PageHeading from '../components/PageHeading';
import PawIcon from '../components/PawIcon';
import AppointmentForm from '../components/appointments/AppointmentForm';
import AppointmentSection from '../components/appointments/AppointmentSection';
import CategoryFilter from '../components/appointments/CategoryFilter';
import {
  categoryInfo,
  createAppointment,
  deleteAppointment,
  groupAppointments,
  markDone,
  markNotDone,
  updateAppointment,
  type Appointment,
  type AppointmentInput,
  type Category,
} from '../lib/appointments';
import { toIsoDate } from '../lib/dates';
import { newId } from '../lib/storage';
import { useAppointments } from '../lib/useAppointments';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useToday } from '../lib/useToday';

export default function AppointmentsPage() {
  const today = useToday();
  useDocumentTitle('Appointments');
  const { items, update } = useAppointments();
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);

  const groups = groupAppointments(items, today, filter);
  const visibleCount = groups.overdue.length + groups.today.length + groups.upcoming.length + groups.done.length;

  const openNew = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (item: Appointment) => { setEditing(item); setFormOpen(true); };
  const closeForm = () => setFormOpen(false);

  const save = (input: AppointmentInput) => {
    if (editing) update((list) => updateAppointment(list, editing.id, input));
    else update((list) => [...list, createAppointment(input, newId())]);
    closeForm();
  };

  const remove = (item: Appointment) => {
    if (!window.confirm(`Delete "${item.title}"? This can't be undone.`)) return;
    update((list) => deleteAppointment(list, item.id));
    closeForm();
  };

  const toggleDone = (item: Appointment) =>
    update((list) => (item.done ? markNotDone(list, item.id) : markDone(list, item.id, today, newId)));

  const sectionProps = { today, onToggleDone: toggleDone, onEdit: openEdit };

  return (
    <>
      <div className="page-heading-row">
        <PageHeading title="Appointments" subtitle="Vet visits, grooming, and medication." />
        <button type="button" className="button" onClick={openNew}>+ Add</button>
      </div>

      {items.length === 0 ? (
        <section className="card empty-state">
          <span className="icon-bubble"><PawIcon size={20} /></span>
          <div>
            <h2>Nothing scheduled yet</h2>
            <p>Add Nemo's next vet visit, grooming appointment, or a medication reminder.</p>
            <button type="button" className="button empty-state-button" onClick={openNew}>Add the first one</button>
          </div>
        </section>
      ) : (
        <>
          <CategoryFilter value={filter} onChange={setFilter} />
          {visibleCount === 0 && (
            <p className="muted-note">No {categoryInfo(filter as Category).label.toLowerCase()} items yet.</p>
          )}
          <AppointmentSection title="Overdue" items={groups.overdue} tone="overdue" {...sectionProps} />
          <AppointmentSection title="Today" items={groups.today} {...sectionProps} />
          <AppointmentSection title="Upcoming" items={groups.upcoming} {...sectionProps} />
          {groups.done.length > 0 && (
            <details className="done-details">
              <summary>Done <span className="count">{groups.done.length}</span></summary>
              <AppointmentSection title="Done" items={groups.done} {...sectionProps} />
            </details>
          )}
        </>
      )}

      <AppointmentForm
        open={formOpen}
        editing={editing}
        defaultDate={toIsoDate(today)}
        onSave={save}
        onDelete={remove}
        onClose={closeForm}
      />
    </>
  );
}
