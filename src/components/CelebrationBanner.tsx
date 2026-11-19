export default function CelebrationBanner({ emoji, children }: { emoji: string; children: string }) {
  return (
    <div className="celebration" role="status">
      <span className="celebration-emoji" aria-hidden="true">{emoji}</span>
      <span>{children}</span>
    </div>
  );
}
