export default function PawIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" fill="currentColor">
      <ellipse cx="32" cy="42" rx="14" ry="12" />
      <ellipse cx="14" cy="28" rx="6" ry="8" />
      <ellipse cx="50" cy="28" rx="6" ry="8" />
      <ellipse cx="24" cy="14" rx="6" ry="8" />
      <ellipse cx="40" cy="14" rx="6" ry="8" />
    </svg>
  );
}
