import { useOnlineStatus } from '../lib/useOnlineStatus';

/** A small note while offline, so nobody wonders why a photo is missing. */
export default function OfflineNotice() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div className="offline-notice" role="status">
      You're offline. Everything still works and saves, but some photos will wait until you're back online.
    </div>
  );
}
