import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const items: { to: string; label: string; fullLabel?: string; icon: ReactNode }[] = [
  {
    to: '/',
    label: 'Home',
    icon: <svg viewBox="0 0 24 24" {...stroke}><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></svg>,
  },
  {
    to: '/appointments',
    label: 'Appointments',
    icon: <svg viewBox="0 0 24 24" {...stroke}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>,
  },
  {
    to: '/diary',
    label: 'Diary',
    icon: <svg viewBox="0 0 24 24" {...stroke}><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" /><path d="M9 9h6M9 13h4" /></svg>,
  },
  {
    to: '/photos',
    label: 'Photos',
    icon: <svg viewBox="0 0 24 24" {...stroke}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5-8 8" /></svg>,
  },
  {
    to: '/daycare',
    label: 'Daycare',
    fullLabel: 'Nemo at Daycare',
    icon: <svg viewBox="0 0 24 24" {...stroke}><rect x="2" y="6" width="14" height="12" rx="2" /><path d="M16 10l6-3v10l-6-3z" /></svg>,
  },
];

export default function BottomNav() {
  return (
    <nav className="nav" aria-label="Main">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          aria-label={item.fullLabel}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
