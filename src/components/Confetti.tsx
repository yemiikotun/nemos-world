import { useEffect, useMemo, useState } from 'react';

const COLORS = ['#e0763c', '#f2b84b', '#7fb7a4', '#e88aa6', '#8fa8e0'];
const PIECES = 48;
const DURATION_MS = 4500;

/**
 * A one-time confetti shower for Gotcha Day and birthdays. Pure CSS, no library.
 * Hidden from screen readers (the celebration banner carries the message),
 * and skipped entirely for people who prefer reduced motion.
 */
export default function Confetti() {
  const [visible, setVisible] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), DURATION_MS);
    return () => clearTimeout(timer);
  }, [visible]);

  const pieces = useMemo(
    () =>
      Array.from({ length: PIECES }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2.4 + Math.random() * 1.6,
        rotate: Math.random() * 360,
        drift: (Math.random() - 0.5) * 120,
        color: COLORS[i % COLORS.length],
        round: i % 3 === 0,
      })),
    [],
  );

  if (!visible) return null;
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className={`confetti-piece${p.round ? ' confetti-round' : ''}`}
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ['--drift' as string]: `${p.drift}px`,
            ['--spin' as string]: `${p.rotate + 540}deg`,
          }}
        />
      ))}
    </div>
  );
}
