import { Link } from 'react-router-dom';
import PawIcon from './PawIcon';
import { NEMO } from '../lib/nemo';

export default function Header() {
  return (
    <header className="header">
      <Link to="/" className="brand" aria-label={`${NEMO.name}'s World home`}>
        <span className="brand-icon"><PawIcon size={22} /></span>
        <span className="brand-name">{NEMO.name}'s World</span>
      </Link>
    </header>
  );
}
