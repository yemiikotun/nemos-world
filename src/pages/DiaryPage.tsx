import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeading from '../components/PageHeading';
import PawIcon from '../components/PawIcon';
import DiaryEntryCard from '../components/diary/DiaryEntryCard';
import DiaryForm from '../components/diary/DiaryForm';
import WalkStatsCard from '../components/diary/WalkStatsCard';
import NemosWeekCard from '../components/diary/NemosWeekCard';
import { deleteEntry, findByDate, saveEntry, searchEntries, sortNewestFirst, type DiaryEntry, type DiaryInput } from '../lib/diary';
import { toIsoDate } from '../lib/dates';
import { newId } from '../lib/storage';
import { useDiary } from '../lib/useDiary';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useToday } from '../lib/useToday';

export default function DiaryPage() {
  const today = useToday();
  useDocumentTitle('Diary');
  const todayIso = toIsoDate(today);
  const { items: entries, update } = useDiary();
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DiaryEntry | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const todaysEntry = findByDate(entries, todayIso);
  const results = sortNewestFirst(searchEntries(entries, query));

  const openEntry = (entry: DiaryEntry | null) => { setEditing(entry); setFormOpen(true); };
  const openToday = () => openEntry(todaysEntry ?? null);

  // The Home page links here with ?write=today to jump straight into today's entry.
  useEffect(() => {
    if (searchParams.get('write') === 'today') {
      openToday();
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const save = (input: DiaryInput) => {
    update((list) => saveEntry(list, input, editing?.id ?? null, newId));
    setFormOpen(false);
  };

  const remove = (entry: DiaryEntry) => {
    if (!window.confirm("Delete this diary entry? This can't be undone.")) return;
    update((list) => deleteEntry(list, entry.id));
    setFormOpen(false);
  };

  return (
    <>
      <div className="page-heading-row">
        <PageHeading title="Nemo's Diary" subtitle="What Nemo got up to, and how far he walked." />
        <button type="button" className="button" onClick={openToday}>
          {todaysEntry ? 'Edit today' : '+ Today'}
        </button>
      </div>

      <WalkStatsCard entries={entries} today={today} />
      <NemosWeekCard entries={entries} today={today} />

      {entries.length === 0 ? (
        <section className="card empty-state diary-empty">
          <span className="icon-bubble"><PawIcon size={20} /></span>
          <div>
            <h2>No diary entries yet</h2>
            <p>Write a few lines about Nemo's day and how long he walked.</p>
            <button type="button" className="button empty-state-button" onClick={openToday}>Write today's entry</button>
          </div>
        </section>
      ) : (
        <section className="diary-list-section" aria-labelledby="entries-title">
          <div className="diary-list-head">
            <h2 id="entries-title" className="section-title">Entries <span className="count">{entries.length}</span></h2>
            <label className="search">
              <span className="visually-hidden">Search diary</span>
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search entries…" />
            </label>
          </div>
          {query.trim() && (
            <p className="muted-note search-summary" role="status">
              {results.length === 0 ? `No entries match "${query.trim()}".` : `${results.length} ${results.length === 1 ? 'entry matches' : 'entries match'}.`}
            </p>
          )}
          <ul className="diary-list">
            {results.map((entry) => (
              <DiaryEntryCard key={entry.id} entry={entry} today={today} onEdit={openEntry} />
            ))}
          </ul>
        </section>
      )}

      <DiaryForm
        open={formOpen}
        editing={editing}
        entries={entries}
        today={today}
        defaultDate={todayIso}
        onSave={save}
        onDelete={remove}
        onOpenExisting={openEntry}
        onClose={() => setFormOpen(false)}
      />
    </>
  );
}
