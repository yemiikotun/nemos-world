import { useState } from 'react';
import { entriesForRecap, requestRecap } from '../../lib/recap';
import type { DiaryEntry } from '../../lib/diary';

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; recap: string }
  | { status: 'error'; message: string };

/** "Nemo's Week": an AI-written recap of the last 7 diary entries, in Nemo's voice. */
export default function NemosWeekCard({ entries, today }: { entries: DiaryEntry[]; today: Date }) {
  const [state, setState] = useState<State>({ status: 'idle' });
  const week = entriesForRecap(entries, today);

  const write = async () => {
    setState({ status: 'loading' });
    try {
      setState({ status: 'done', recap: await requestRecap(week) });
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Something went wrong.' });
    }
  };

  return (
    <section className="card nemos-week" aria-labelledby="nemos-week-title" aria-busy={state.status === 'loading'}>
      <div className="nemos-week-head">
        <div>
          <h2 id="nemos-week-title" className="stat-label">Nemo's Week</h2>
          <p className="nemos-week-sub">Nemo tells the story of his week, written with AI.</p>
        </div>
        <button
          type="button"
          className="button"
          onClick={write}
          disabled={week.length === 0 || state.status === 'loading'}
        >
          {state.status === 'loading' ? 'Writing…' : state.status === 'done' ? 'Write again' : '✨ Write it'}
        </button>
      </div>

      <div aria-live="polite">
        {week.length === 0 && (
          <p className="muted-note nemos-week-note">Write a diary entry this week and Nemo will tell you all about it.</p>
        )}
        {state.status === 'loading' && <p className="muted-note nemos-week-note">Nemo is thinking… 🐾</p>}
        {state.status === 'error' && <p className="form-warning nemos-week-note" role="alert">{state.message}</p>}
        {state.status === 'done' && (
          <>
            <blockquote className="nemos-week-recap">{state.recap}</blockquote>
            <p className="hint nemos-week-credit">
              Written by Claude from {week.length} diary {week.length === 1 ? 'entry' : 'entries'}.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
