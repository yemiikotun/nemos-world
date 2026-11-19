import { useCallback, useEffect, useState } from 'react';
import { loadList, saveList, subscribe, type StorageKey } from './storage';

/**
 * A list saved in the browser and kept in sync across open tabs.
 * Changes are made by passing a pure function: update((items) => newItems).
 */
export function useStoredList<T>(key: StorageKey, isItem: (value: unknown) => value is T) {
  const [items, setItems] = useState<T[]>(() => loadList(key, isItem));

  useEffect(() => {
    saveList(key, items);
  }, [key, items]);

  useEffect(() => subscribe(key, () => setItems(loadList(key, isItem))), [key, isItem]);

  const update = useCallback((change: (items: T[]) => T[]) => setItems(change), []);

  return { items, update };
}
