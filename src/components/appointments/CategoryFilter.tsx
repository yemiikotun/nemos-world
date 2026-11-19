import { CATEGORIES, type Category } from '../../lib/appointments';

interface Props {
  value: Category | 'all';
  onChange: (value: Category | 'all') => void;
}

export default function CategoryFilter({ value, onChange }: Props) {
  const options = [{ id: 'all' as const, label: 'All', emoji: '' }, ...CATEGORIES];
  return (
    <div className="chips" role="group" aria-label="Filter by category">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={`chip${value === option.id ? ' chip-active' : ''}`}
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
        >
          {option.emoji && <span aria-hidden="true">{option.emoji} </span>}
          {option.label}
        </button>
      ))}
    </div>
  );
}
