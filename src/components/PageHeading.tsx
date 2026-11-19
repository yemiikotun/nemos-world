export default function PageHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="page-heading">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}
