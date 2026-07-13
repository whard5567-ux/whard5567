export function ChartCard({
  title,
  badge,
  className = "",
  style,
  children,
}: {
  title: string;
  badge?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <section style={style} className={`card flex flex-col p-4 bg-surface-2 transition-all duration-300 hover:shadow-xl hover:border-edge-strong ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="card-title">{title}</h3>
        {badge && (
          <span className="num rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-ink-2">
            {badge}
          </span>
        )}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}
