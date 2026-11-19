import { isDiaryEntry } from './diary';
import { STORAGE_KEYS } from './storage';
import { useStoredList } from './useStoredList';

/** Diary entries saved in the browser. */
export function useDiary() {
  return useStoredList(STORAGE_KEYS.diary, isDiaryEntry);
}
