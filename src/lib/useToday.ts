import { useEffect, useState } from 'react';
import { addDays, startOfDay } from 'date-fns';
import { parseLocalDate } from './dates';

/**
 * Today's date (local midnight). Updates itself at midnight so the counters
 * roll over if the app is left open overnight.
 *
 * Development only: add ?date=YYYY-MM-DD to the URL to pretend it's another
 * day, e.g. to preview Nemo's Gotcha Day celebration.
 */
export function useToday(): Date {
  const [today, setToday] = useState(() => readToday());

  useEffect(() => {
    if (devOverride()) return;
    const msUntilMidnight = addDays(startOfDay(new Date()), 1).getTime() - Date.now();
    const timer = setTimeout(() => setToday(readToday()), msUntilMidnight + 1000);
    return () => clearTimeout(timer);
  }, [today]);

  return today;
}

function readToday(): Date {
  return devOverride() ?? startOfDay(new Date());
}

function devOverride(): Date | null {
  if (!import.meta.env.DEV) return null;
  const param = new URLSearchParams(window.location.search).get('date');
  if (!param) return null;
  try {
    return parseLocalDate(param);
  } catch {
    return null;
  }
}
