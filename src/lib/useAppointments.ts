import { isAppointment } from './appointments';
import { STORAGE_KEYS } from './storage';
import { useStoredList } from './useStoredList';

/** Appointments saved in the browser. */
export function useAppointments() {
  return useStoredList(STORAGE_KEYS.appointments, isAppointment);
}
